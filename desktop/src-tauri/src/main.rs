#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::Manager;
use std::{fs, io::Write};

#[tauri::command]
fn load_state(app: tauri::AppHandle) -> Result<String,String> {
 let path=app.path().app_data_dir().map_err(|_|"Папка данных недоступна")?.join("state.json");
 if !path.exists(){return Ok("null".into())}
 let current=fs::read_to_string(&path).ok().filter(|data|serde_json::from_str::<serde_json::Value>(data).is_ok());
 if let Some(data)=current{return Ok(data)}
 let previous=fs::read_to_string(path.with_file_name("state.previous.json")).map_err(|_|"Не удалось прочитать сохранённые ответы")?;
 serde_json::from_str::<serde_json::Value>(&previous).map_err(|_|"Копия ответов повреждена")?;Ok(previous)
}
#[tauri::command]
fn save_state(app: tauri::AppHandle, data:String) -> Result<(),String> {
 if data.len()>24_000_000{return Err("Слишком много сохранённых данных".into())}
 serde_json::from_str::<serde_json::Value>(&data).map_err(|_|"Неверный формат данных")?;
 let dir=app.path().app_data_dir().map_err(|_|"Папка данных недоступна")?;
 fs::create_dir_all(&dir).map_err(|_|"Не удалось создать папку данных")?;
 let temp=dir.join("state.tmp");
 let mut file=fs::File::create(&temp).map_err(|_|"Не удалось сохранить ответы")?;
 file.write_all(data.as_bytes()).and_then(|_|file.sync_all()).map_err(|_|"Не удалось сохранить ответы")?;
 // Keep the previous complete state if a power failure interrupts replacement.
 let target=dir.join("state.json");let previous=dir.join("state.previous.json");
 if target.exists(){fs::copy(&target,&previous).map_err(|_|"Не удалось создать копию ответов")?;}
 fs::rename(&temp,&target).map_err(|_|"Не удалось обновить ответы")?;Ok(())
}
#[tauri::command]
async fn export_result(data:String) -> Result<bool,String> {
 if data.len()>6_000_000{return Err("Файл слишком большой".into())}
 tauri::async_runtime::spawn_blocking(move ||{
  let path=rfd::FileDialog::new().set_file_name("result.lumina-result").add_filter("Результат LuminaPortal",&["lumina-result"]).save_file();
  match path {Some(p)=>fs::write(p,data).map(|_|true).map_err(|_|"Не удалось сохранить файл".into()),None=>Ok(false)}
 }).await.map_err(|_|"Не удалось открыть окно сохранения".to_string())?
}
#[tauri::command]
async fn api_request(local:bool, action:String, body:serde_json::Value, token:Option<String>) -> Result<serde_json::Value,String> {
 let route=match action.as_str(){"login"=>"/api/auth/login","upload"=>"/api/results",_=>return Err("Запрос запрещён".into())};
 let base=if local{"http://127.0.0.1:4189"}else{"https://luminaportal-edu.vercel.app"};
 let client=reqwest::Client::builder().timeout(std::time::Duration::from_secs(30)).redirect(reqwest::redirect::Policy::none()).build().map_err(|_|"Ошибка подключения")?;
 let mut req=client.post(format!("{base}{route}")).json(&body);
 if let Some(t)=token{req=req.bearer_auth(t);}
 let response=req.send().await.map_err(|_|"Нет связи с сайтом. Результат остаётся на устройстве.")?;
 let status=response.status();let data:serde_json::Value=response.json().await.map_err(|_|"Сайт вернул неверный ответ")?;
 if !status.is_success(){return Err(data["error"].as_str().unwrap_or("Не удалось выполнить запрос. Проверьте вход и повторите.").into())}Ok(data)
}
fn main(){tauri::Builder::default().invoke_handler(tauri::generate_handler![load_state,save_state,export_result,api_request]).run(tauri::generate_context!()).expect("LuminaPortal failed to start");}

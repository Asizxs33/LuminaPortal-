use std::io::{Read,Seek,SeekFrom};

const MAGIC:&[u8;16]=b"LUMINA_TEST_001!";
const LIMIT:u64=5_500_000;

// A portable Windows executable may carry one data-only test after its PE image.
// Only a bounded, explicitly marked trailer is read; nothing is executed from it.
pub fn read(reader:&mut (impl Read+Seek))->Result<Option<String>,String>{
 let size=reader.seek(SeekFrom::End(0)).map_err(|_|"Не удалось прочитать программу")?;
 if size<20{return Ok(None)}
 reader.seek(SeekFrom::End(-20)).map_err(|_|"Не удалось прочитать программу")?;
 let mut tail=[0u8;20];reader.read_exact(&mut tail).map_err(|_|"Не удалось прочитать программу")?;
 if &tail[4..]!=MAGIC{return Ok(None)}
 let length=u32::from_le_bytes(tail[..4].try_into().unwrap()) as u64;
 if length==0||length>LIMIT||length+20>size{return Err("Встроенный тест повреждён. Скачайте программу заново.".into())}
 reader.seek(SeekFrom::End(-20-(length as i64))).map_err(|_|"Не удалось прочитать тест")?;
 let mut data=vec![0u8;length as usize];reader.read_exact(&mut data).map_err(|_|"Встроенный тест повреждён")?;
 String::from_utf8(data).map(Some).map_err(|_|"Неверная кодировка встроенного теста".into())
}

#[cfg(test)]
mod tests{
 use super::*;use std::io::Cursor;
 fn packed(data:&[u8],length:u32)->Cursor<Vec<u8>>{let mut bytes=b"MZ executable stub".to_vec();bytes.extend(data);bytes.extend(length.to_le_bytes());bytes.extend(MAGIC);Cursor::new(bytes)}
 #[test]fn ordinary_executable(){assert_eq!(read(&mut Cursor::new(vec![0;100])).unwrap(),None);}
 #[test]fn unicode_payload(){let text="{\"title\":\"Қазақша тест\"}";assert_eq!(read(&mut packed(text.as_bytes(),text.len() as u32)).unwrap(),Some(text.into()));}
 #[test]fn truncated_payload(){assert!(read(&mut packed(b"{}",1000)).is_err());}
 #[test]fn oversized_payload(){assert!(read(&mut packed(b"{}",LIMIT as u32+1)).is_err());}
 #[test]fn empty_payload(){assert!(read(&mut packed(b"",0)).is_err());}
 #[test]fn invalid_utf8(){assert!(read(&mut packed(&[255],1)).is_err());}
}

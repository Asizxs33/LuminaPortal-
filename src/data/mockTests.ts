export interface QuestionOption {
    id: string;
    text: string;
}

export interface Question {
    id: string;
    text: string;
    options: QuestionOption[];
    correctOptionId: string;
    explanation?: string;
}

export interface TestData {
    id: string;
    title: string;
    subject: string;
    description: string;
    durationMinutes: number;
    passScorePercentage: number;
    questions: Question[];
}

export const mockTests: Record<string, TestData> = {
    'math': {
        id: 'math',
        title: 'Жоғары математика: Сызықтық алгебра',
        subject: 'Математика',
        description: 'Матрицалар, анықтауыштар және сызықтық теңдеулер жүйесі бойынша аралық бақылау.',
        durationMinutes: 45,
        passScorePercentage: 70,
        questions: [
            {
                id: 'q1',
                text: 'Егер матрицаның екі жолы бірдей болса, оның анықтауышы неге тең?',
                options: [
                    { id: 'a', text: 'Нөлге тең' },
                    { id: 'b', text: 'Бірге тең' },
                    { id: 'c', text: 'Матрицаның өлшеміне байланысты' },
                    { id: 'd', text: 'Есептеуге келмейді' }
                ],
                correctOptionId: 'a',
                explanation: 'Егер матрицаның екі қатары немесе бағанасы бірдей болса, онда оның анықтауышы нөлге тең болады.'
            },
            {
                id: 'q2',
                text: 'A және B матрицалары берілген. AB = BA теңдігі әрқашан орындала ма?',
                options: [
                    { id: 'a', text: 'Иә, әрқашан орындалады' },
                    { id: 'b', text: 'Жоқ, әрқашан орындалмайды' },
                    { id: 'c', text: 'Тек шаршы матрицалар үшін орындалады' },
                    { id: 'd', text: 'Матрицалар нөлдік болғанда ғана' }
                ],
                correctOptionId: 'b',
                explanation: 'Матрицаларды көбейту коммутативті емес.'
            },
            {
                id: 'q3',
                text: 'Крамер ережесі қандай теңдеулер жүйесін шешуге қолданылады?',
                options: [
                    { id: 'a', text: 'Белгісіздер саны теңдеулер санынан артық' },
                    { id: 'b', text: 'Анықтауышы нөлге тең шаршы жүйелер' },
                    { id: 'c', text: 'Анықтауышы нөлге тең емес сызықтық теңдеулер жүйесі' },
                    { id: 'd', text: 'Тек біртекті теңдеулер жүйесі' }
                ],
                correctOptionId: 'c'
            }
        ]
    },
    'physics': {
        id: 'physics',
        title: 'Жоғары физика: Кванттық механика',
        subject: 'Физика',
        description: 'Кванттық жүйелердің негіздері, Шредингер теңдеуі және Гейзенберг принципі.',
        durationMinutes: 60,
        passScorePercentage: 60,
        questions: [
            {
                id: 'q1',
                text: 'Бөлшектің дәл орны мен импульсін бір уақытта білу мүмкін емес екенін қандай принцип тұжырымдайды?',
                options: [
                    { id: 'a', text: 'Шредингер мысығы парадоксі' },
                    { id: 'b', text: 'Гейзенбергтің анықсыздық принципі' },
                    { id: 'c', text: 'Паулидің ерекшелік принципі' },
                    { id: 'd', text: 'Фотоэффект' }
                ],
                correctOptionId: 'b'
            },
            {
                id: 'q2',
                text: 'Бір кванттық күйде бірдей екі фермион бола алмайтынын қандай заң көрсетеді?',
                options: [
                    { id: 'a', text: 'Паули принципі' },
                    { id: 'b', text: 'Бор постулаттары' },
                    { id: 'c', text: 'Планк заңы' },
                    { id: 'd', text: 'Хунд ережесі' }
                ],
                correctOptionId: 'a'
            }
        ]
    },
    'history': {
        id: 'history',
        title: 'Қазақстан тарихы: Тәуелсіздік кезеңі',
        subject: 'Тарих',
        description: 'Қазақстанның тәуелсіздік алғаннан кейінгі саяси және экономикалық дамуы.',
        durationMinutes: 30,
        passScorePercentage: 50,
        questions: [
            {
                id: 'q1',
                text: 'Қазақстан Республикасының Мемлекеттік рәміздері қашан қабылданды?',
                options: [
                    { id: 'a', text: '1991 жылғы 16 желтоқсан' },
                    { id: 'b', text: '1992 жылғы 4 маусым' },
                    { id: 'c', text: '1993 жылғы 28 қаңтар' },
                    { id: 'd', text: '1995 жылғы 30 тамыз' }
                ],
                correctOptionId: 'b'
            },
            {
                id: 'q2',
                text: 'Ұлттық валюта – Теңге айналымға қашан енгізілді?',
                options: [
                    { id: 'a', text: '1992 жылғы қараша' },
                    { id: 'b', text: '1993 жылғы 15 қараша' },
                    { id: 'c', text: '1994 жылғы қаңтар' },
                    { id: 'd', text: '1995 жылғы тамыз' }
                ],
                correctOptionId: 'b'
            }
        ]
    }
};

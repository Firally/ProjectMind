# ProjectMind

[Cпецификация проекта](https://github.com/Firally/ProjectMind/blob/main/specifications.md)

Автор проекта - Никитина Алина Андреевна (tg - @lynxfai)

Протестировать приложение можно [тут](https://projectmind.ru.tuna.am)

[Видео теста приложения](https://drive.google.com/file/d/1sS0B2eTlp8zv3062sOpmXzCnzMiLKgLN/view?usp=sharing).
____________________________________________________________________________________________________

В тестовой версии поддерживается только один пользователь по умолчанию: user / password

## Примеры для валидации

Для проведения тестирования приложения можно воспользоваться следующими файлами для проектов.

#### 1. Проект - изучение баз данных.

- Задача - выполнить задание по БД MongoDB.
- Заметка - Задание (MongoDB) + прикрепить [файл](https://docs.google.com/document/d/155ihSS0_-perjNilGv5Af9WcVTdzo_sD/edit?usp=sharing&ouid=105885410301062553353&rtpof=true&sd=true).

В чате с помощником можно задать любой вопрос, касательно задания. Пример:

<img width="382" alt="image" src="https://github.com/user-attachments/assets/3184d20e-b374-4052-802d-7a967a6a7ef6" />

#### 2. Проект - изучение программирования на C#

- Задача - выполнить задание по програмированию
- Заметка - задание по программированию + прикрепить [файл](https://drive.google.com/file/d/1OcoRitZRQuWLIpE-vFfnOjGhiEEi1Ur8/view?usp=sharing).

В чате с помощником можно задать любой вопрос, касательно задания. Пример:

<img width="376" alt="image" src="https://github.com/user-attachments/assets/fa5f464c-0f59-4c2c-a440-3d47a5d062d1" />

#### 3. Проект - Физика

- Задача - составить презентацию по физике
- Заметка - текст презентации по физике + прикрепить [файл](https://docs.google.com/document/d/1zqYJM4Mh_142wd9nA_soB0ipeyosDTGb/edit?usp=sharing&ouid=105885410301062553353&rtpof=true&sd=true)

В чате с помощником можно задать любой вопрос, касательно текста. Пример:

<img width="377" alt="image" src="https://github.com/user-attachments/assets/23ebd85a-d0fa-44b4-a842-61be322f2986" />

_____________________________________________________________________________

Для запуска приложения локально:

### Frontend

Установите node.js на свой пк. 

Для mac, можно установить с помощью brew:

```bash
brew install node
```

Для linux:

```bash
sudo apt install nodejs
sudo apt install npm
```

Затем перейдите в директорию frontend и введите следующие команды

```bash
npm install
npm start
```

После выполнения этих команд, по адресу http://localhost:3000 должен запуститься фронтенд приложения

Запуск необходимых сервисов:

### RAG-service

1. Перейдите в директорию services/RAG
2. Создайте новую виртуальную среду python и активируйте ее
3. Создайте файл .env и внесите в него строку с OPENAI_API_KEY

```
OPENAI_API_KEY=<Ваш ключ OPENAI_API_KEY>
```

4. Установите необходимые библиотеки

```bash
pip install -r requirements.txt
```

5. Запустите сервис

```bash
uvicorn RAG_service:app --reload --port=8090
```

### Whisper-service для перевода голоса в текст

*Для запуска сервиса должен быть установлен ffmpeg.*

1. Перейдите в директорию services/whisper
2. Создайте новую виртуальную среду python и активируйте ее
3. Установите необходимые библиотеки
   
```bash
pip install -r requirements.txt
```

4. Запустите сервис

```bash
uvicorn whisper_service:app --reload --port=8000
```

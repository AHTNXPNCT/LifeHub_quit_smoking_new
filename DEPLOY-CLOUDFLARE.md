# Публикация LifeHub: GitHub → Cloudflare Pages

Следуйте только этим шагам. Это статический сайт, поэтому Worker, `wrangler`, Netlify, команды `npx wrangler deploy` и переменные окружения не нужны.

## Часть 1. GitHub

1. Скачайте `lifehub-github-cloudflare-source.zip` и распакуйте его.
2. Откройте https://github.com/new.
3. В поле **Repository name** напишите: `lifehub-quit-smoking`.
4. Выберите **Private**, затем нажмите **Create repository**.
5. На странице нового репозитория нажмите **Add file** → **Upload files**.
6. Откройте распакованную папку LifeHub, выделите в ней всё сочетанием `Ctrl + A` и перетащите выделенные файлы в окно GitHub. Важно: среди них должны быть `package.json`, `pnpm-lock.yaml`, `index.html`, папки `src`, `public` и `.github`.
7. Внизу страницы нажмите зелёную кнопку **Commit changes**.

После этого в GitHub должны быть видны файл `package.json` и папки `src` и `public`. Если вместо них видна только одна вложенная папка, вернитесь на шаг 6 и загрузите **содержимое** этой папки, а не саму папку.

## Часть 2. Cloudflare Pages

1. Откройте https://dash.cloudflare.com и войдите в свой аккаунт.
2. Слева выберите **Workers & Pages** → **Create application**.
3. Найдите раздел **Pages** и выберите **Import an existing Git repository** → **Get started**.
4. Нажмите **Connect GitHub**, подтвердите доступ Cloudflare к GitHub и выберите репозиторий `lifehub-quit-smoking`.
5. На странице настройки заполните ровно так:

| Поле | Значение |
| --- | --- |
| Production branch | `main` |
| Framework preset | `Vite` (если поле показано) |
| Build command | `pnpm run build` |
| Build output directory | `dist` |
| Root directory | оставить пустым |

6. Не добавляйте переменные окружения.
7. Нажмите **Save and Deploy**.

Важно: если экран предлагает поле **Deploy command** со значением `npx wrangler deploy`, это создание **Worker**, а не Pages. Нажмите **Back** и вернитесь к пункту 3.

## Проверка

1. В разделе **Deployments** дождитесь статуса **Success**.
2. Откройте ссылку вида `https://lifehub-quit-smoking.pages.dev` из карточки успешного развёртывания.
3. На первом экране должна появиться фраза «Бросай никотин и живи» и шаг 1 из 3.
4. Если вы видите старую пустую страницу, нажмите `Ctrl + F5`.

## Обновление в будущем

После изменения файлов в GitHub Cloudflare сам запустит новую сборку. Вручную ничего загружать в Cloudflare не нужно.

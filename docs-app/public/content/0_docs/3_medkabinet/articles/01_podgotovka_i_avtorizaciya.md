# Подготовка к работе и авторизация

## Настройка УКЭП

Чтобы использовать АРМ, нужна ЭП. Для создания ЭП медицинский работник получает ключ УКЭП в удостоверяющем центре.

Для корректной работы ЭП нужно:

1.  Установить на ПК криптографическую программу – «КриптоПро CSP» версии 5.0 и выше. Лицензия приобретается в аккредитованном УЦ, где оформлялся ключ УКЭП. КриптоПро CSP доступен по ссылке [http://cryptopro.ru/products/csp/overview](https://www.google.com/url?q=http://cryptopro.ru/products/csp/overview&sa=D&source=editors&ust=1773676566188580&usg=AOvVaw1yd0pCzoVuFBrwDo-i3llx) – необходимо скачать файл и выполнить установку программы на ПК.
2.  Установить и включить расширение «CryptoPro Extension for CAdES Browser Plug-in». Актуальные версии расширения, а также инструкции по установке находятся на [официальном сайте КриптоПро](https://www.google.com/url?q=https://www.cryptopro.ru/products/cades/plugin&sa=D&source=editors&ust=1773676566189039&usg=AOvVaw07dbZ0d2LxuB5hdopKre2S).
3.  Установить корневой сертификат УЦ, в котором оформлялся ключ УКЭП. Корневые сертификаты публикуются на официальном [сайте аккредитованного УЦ](https://www.google.com/url?q=https://e-trust.gosuslugi.ru/registry/accreditation?filter%3DeyJhc2NlbmRpbmciOmZhbHNlLCJjaXRpZXMiOm51bGwsImNyeXB0VG9vbENsYXNzZXMiOm51bGwsIm9yZGVyQnkiOiJpZCIsInBhZ2UiOjEsInJlY29yZHNPblBhZ2UiOjEwLCJzZWFyY2hTdHJpbmciOm51bGwsInNvZnR3YXJlIjpudWxsLCJzdGF0dXNlcyI6bnVsbH0%253D&sa=D&source=editors&ust=1773676566189438&usg=AOvVaw2_0EC0nSdxGTJ9qieM59qx).
4.  Проверить корректность предварительной настройки рабочего места:

    - перейти по ссылке [страница проверки CAdES-BES (CryptoPro)](https://cryptopro.ru/sites/default/files/products/cades/demopage/cades_bes_sample.html);
    - или открыть расширение «CryptoPro Extension for CAdES Browser Plug-in», а затем нажать на кнопку «Проверить работу плагина».

Окно проверки рабочего места отображает:

<ol type="a">
<li>данные о работе компонентов ЭП;</li>
<li>полезные ссылки, ссылки для скачивания компонентов ЭП.</li>
</ol>

![Окно проверки: компоненты ЭП и ссылки](/content/0_docs/3_medkabinet/images/01_podgotovka_i_avtorizaciya/01_okno_proverki_komponenty_ep_i_ssylki.png)

<ol type="a" start="3">
<li>краткую информацию об установленных сертификатах;</li>
<li>подробную информацию о выбранном сертификате;</li>
<li>результат проверки тестовой подписи с выбранным сертификатом ЭП.</li>
</ol>

![Окно проверки: сертификаты и тестовая подпись](/content/0_docs/3_medkabinet/images/01_podgotovka_i_avtorizaciya/02_okno_proverki_sertifikaty_testovaya_podpis.png)

Для настройки компонентов ЭП и дальнейшей работы на платформе «MedControl» рекомендуется браузер Chromium-Gost, Яндекс.Браузер.

<div class="docs-important">
<div class="docs-important-title">ВАЖНО!</div>
<p>Для корректной работы нужно выполнить настройку синхронизации часов на ПК с сервером времени в Интернете. Сделать это можно через сервис <a href="https://www.ntp-servers.net/">NTP SERVERS</a>.</p>
</div>

### Авторизация

После настройки ЭП нужно авторизоваться в личном кабинете АРМ – указать электронную почту, на которую была зарегистрирована УЗ в АРМ, получить на почту код доступа, придумать пароль и войти в кабинет с почтой и паролем. Подробнее о процессе авторизации — в статье [«Авторизация в АРМ»](/0_docs/1_obshee/articles/01_avtorizaciya_v_arm).

Также медработники имеют возможность авторизоваться в MedControl через портал «Госуслуги». Для этого нужно:

1.  На странице авторизации выбрать «Вход для медработников».

![Страница авторизации: вход для медработников](/content/0_docs/3_medkabinet/images/01_podgotovka_i_avtorizaciya/03_stranica_avtorizacii_vhod_dlya_medrabotnikov.png)

2.  Дождаться загрузки портала. Ввести логин и пароль от «Госуслуг» или войти через сканирование QR-кода на телефоне.
![Портал «Госуслуги»: окно входа](/content/0_docs/3_medkabinet/images/01_podgotovka_i_avtorizaciya/04_portal_gosuslugi_okno_vhoda.png)

3.  Выдать системе необходимые разрешения.

![Запрос разрешений при входе через «Госуслуги»](/content/0_docs/3_medkabinet/images/01_podgotovka_i_avtorizaciya/05_gosuslugi_zapros_razresheniy.png)

4.  При наличии у медработника нескольких доступных для входа медорганизаций – выбрать нужную. В списке отображаются организации, в которых у медработника есть учетная запись с одинаковым СНИЛС.

![Выбор медорганизации при входе](/content/0_docs/3_medkabinet/images/01_podgotovka_i_avtorizaciya/06_vybor_medorganizacii.png)



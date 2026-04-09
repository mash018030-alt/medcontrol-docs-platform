# Возможные результаты осмотров

У осмотра может быть разный результат в зависимости от многих факторов: был ли осмотр завершён, отправлен ли медработнику, какие данные были получены в процессе измерений и пр.Первостепенно осмотры можно разделить на две категории: – «Обработан» и «Не обработан». Обработанными считаются осмотры с полученным заключением от медработника. В категорию необработанных попадают осмотры, не отправленные медработнику по каким-либо причинам – например, работник прервал осмотр сам, осмотр был прерван третьим лицом или не взят вовремя медработником на вынесение заключения.

Обработанные осмотры можно найти в разделе «Осмотры» через расширенный фильтр «Результат осмотра».

![01_vozmozhnye_rezul_taty_osmotrov.png](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/01_vozmozhnye_rezul_taty_osmotrov.png)

Необработанные – через фильтр «Дополнительные параметры».

![02_vozmozhnye_rezul_taty_osmotrov.png](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/02_vozmozhnye_rezul_taty_osmotrov.png)

## Обработанные осмотры

При обработке медработник выносит решение:
- «Допустить»/Не допустить» – по предрейсовому и предсменному осмотру;

![03_dopustit_ne_dopustit_po_predreysovomu_i_pr.png](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/03_dopustit_ne_dopustit_po_predreysovomu_i_pr.png)

Такие осмотры будут отображаться с заключением «Допущен»/«Не допущен»

- «Валидировать» – по послерейсовому, послесменному осмотру и осмотру в течение рабочего дня (смены).

![04_validirovat_po_poslereysovomu_poslesmennom.png](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/04_validirovat_po_poslereysovomu_poslesmennom.png)

У этих осмотров будет заключение «Прошёл»/«Не прошёл».

<details class="docs-disclosure">
<summary>Условия вынесения заключений</summary>

<table class="docs-table">
<thead>
<tr>
<th>Заключение</th>
<th>Предрейсовый / предсменный</th>
<th>Послерейсовый / послесменный, в течение рабочего дня (смены)</th>
</tr>
</thead>
<tbody>
<tr>
<td>Допущен</td>
<td>При отсутствии замечаний</td>
<td>—</td>
</tr>
<tr>
<td>Не допущен</td>
<td>При наличии любых замечаний</td>
<td>—</td>
</tr>
<tr>
<td>Прошёл</td>
<td>—</td>
<td>Нет замечаний или есть только медицинские и/или некритичные административные</td>
</tr>
<tr>
<td>Не прошёл</td>
<td>—</td>
<td>Есть технические и/или критичные административные замечания</td>
</tr>
</tbody>
</table>

</details>

Дополнительно к заключению медработник при необходимости выбирает в интерфейсе замечания – медицинские, административные или технические.

![Выбор медицинских замечаний при вынесении заключения](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/05_vybor_meditsinskih_zamechaniy_pri_vyneseni.png)

![Выбор административных замечаний: критичные и некритичные](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/06_vybor_administrativnyh_zamechaniy_kritichn.png)

![Выбор технических замечаний при вынесении заключения](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/07_vybor_tehnicheskih_zamechaniy_pri_vyneseni.png)

Система автоматически определяет итоговый результат осмотра – на основании замечаний медработника и их приоритетности.

Пример: медработник вынес решение «Не допустить» и выбрал замечания:

- «Обнаружен алкоголь» (медицинское);
- «Нарушение порядка прохождения осмотра» (административное).

В этом случае заключение будет отображаться как «Не допущен (алкоголь)», т.к. алкоголь – более приоритетный фактор для системы.

Обработанные осмотры могут быть со следующими результатами:

- Административные – при административных замечаниях, влияющих на идентификацию работника, результаты измерений и пр. Например, работник не снял маску/очки.
- Алкоголь – зафиксировано наличие паров этанола в выдыхаемом воздухе.
- Подлог – если осмотр или отдельный его этап (тонометрия, алкотестирование, термометрия) был пройден посторонним.
- Невозможно идентифицировать работника – если медработник не может сравнить лицо работника на видеозаписи с фото в карточке (например, некачественное освещение в помещении, работник вне зоны видимости камеры и пр).
- Медицинские – при наличии медицинских замечаний от медработника, которые были выявлены при просмотре видеозаписи или анализе жалоб.
- Успешные – осмотры с результатами:

  - «Допущен» – без любых замечаний;
  - «Прошёл» – без замечаний или с медицинскими и/или некритичными административными замечаниями.

- Технические – при замечаниях технического характера, например, не удалось загрузить фото/видео.

Таким образом, в осмотре всегда отображается заключение, а дополнительно к нему может добавляться результат. В случаях отстранения дополнительно отображается причина отстранения. Если причин было несколько – отображается приоритетная.

Осмотр с заключением:

![08_tehnicheskie_pri_zamechaniyah_tehnicheskog.png](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/08_tehnicheskie_pri_zamechaniyah_tehnicheskog.png)

Осмотр с заключением и причиной отстранения:

![09_obrabotannye_osmotry.png](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/09_obrabotannye_osmotry.png)

---

### Необработанные осмотры

Необработанные осмотры не отправляются медработнику на вынесение заключения и будут отображаться только с результатом, который проставляется автоматически.

![10_neobrabotannye_osmotry.png](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/10_neobrabotannye_osmotry.png)

Возможные результаты необработанных осмотров:

- Нарушение тех.условий – условия окружающей среды в помещении, где установлен ПАК или технические параметры не соответствуют требуемым. Например, нарушена целостность корпуса ПАК/недостаточный уровень освещения. Отображается при выборе фильтра «Нарушены тех.условия» и/или «Вскрыт корпус».

![11_narushenie_teh_usloviy_usloviya_okruzhayus.png](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/11_narushenie_teh_usloviy_usloviya_okruzhayus.png)

- Таймаут обработки (по фильтру «Сбой обработки) – не было вынесено заключение по осмотру в течение 30 минут.

![12_taymaut_obrabotki_po_fil_tru_sboy_obrabotk.png](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/12_taymaut_obrabotki_po_fil_tru_sboy_obrabotk.png)

- Нарушение порядка проведения осмотра – если работник некорректно проводил измерения, например, неправильно наложил манжету/слабо выдыхал в трубку при алкотестировании и пр.

![13_narushenie_poryadka_provedeniya_osmotra_es.png](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/13_narushenie_poryadka_provedeniya_osmotra_es.png)

- Осмотр не завершён (прерван пользователем) – осмотр прерван работником в процессе его прохождения (нажал кнопку «Завершить осмотр»). Результат отображается по фильтру «Незавершённые осмотры»

![14_osmotr_ne_zavershyon_prervan_pol_zovatelem.png](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/14_osmotr_ne_zavershyon_prervan_pol_zovatelem.png)

- Осмотр не завершён (тайм-аут) – работник не успел пройти осмотр в отведённое время. Результат отображается по фильтру «Незавершённые осмотры».

![15_osmotr_ne_zavershyon_taym_aut_rabotnik_ne.png](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/15_osmotr_ne_zavershyon_taym_aut_rabotnik_ne.png)

- Отменён вручную – осмотр отменен работником после его прохождения осмотра. Отмена производится через ПАК. Отменить можно осмотры, которые не отправились медработникам по техническим причинам (например, не подгрузилось видео). Результат отображается по фильтру «Незавершённые осмотры».

![16_otmenyon_vruchnuyu_osmotr_otmenen_rabotnik.png](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/16_otmenyon_vruchnuyu_osmotr_otmenen_rabotnik.png)

- Сбой видео (по фильтру «Видео не загрузилось») – в осмотр не загрузилось видео в течение отведённого времени (10 минут).

![17_sboy_video_po_fil_tru_video_ne_zagruzilos.png](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/17_sboy_video_po_fil_tru_video_ne_zagruzilos.png)

- Сбой оборудования – при прохождении осмотра оборудование вышло из строя, измерения провести невозможно.

![18_sboy_oborudovaniya_pri_prohozhdenii_osmotr.png](/content/0_docs/1_obshee/images/06_vozmozhnye_rezultaty_osmotrov/18_sboy_oborudovaniya_pri_prohozhdenii_osmotr.png)


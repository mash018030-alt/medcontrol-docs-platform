# Светлый фон (плитки на заглавных страницах)

Образец-скрин (если добавите): **`light.png`** в этой папке `engine/docs-brand/colors/`.

HEX фона: **`#E6E9FF`** · RGB: `230, 233, 255`

Используется как заливка карточек сетки разделов (`.docs-landing-tile`), **свёрнутой** полоски `summary` у раскрывающихся блоков `.docs-disclosure` и **объединённых / технически пустых ячеек** в таблицах статей (класс `docs-table-cell-merged` на `td`). В CSS: `--docs-light-bg` и `--docs-landing-tile-*` в `engine/src/App.css`. Договорённость зафиксирована в `color-palette.md`.

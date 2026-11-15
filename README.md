# do Poznania — V6 / ŻYWE VIDEO + SCROLL

## Co zostało naprawione

V5 używało `video.pause()` i przeskakiwania do kolejnych klatek przez `currentTime`.
Powodowało to zamieranie gwiazdek i pyłu. V6 odtwarza teraz film płynnie w pętli
(autoplay, muted, loop, playsinline), także gdy użytkownik nie przewija.

Scroll steruje przybliżeniem i ruchem sceny, kolejnością rozdziałów i progressem
po prawej. Podczas scrolla film może przyspieszać, ale nie jest pauzowany.
To wizualna podróż z paralaksą, nie fizyczna geometria 3D.

## Deploy na Netlify
Rozpakuj ZIP i przeciągnij folder do https://app.netlify.com/drop

## Formularz
Po wdrożeniu `https://twoja-domena/#zapisz-sie` prowadzi do formularza.
Formularz Netlify Forms należy zweryfikować i skonfigurować; uzupełnij
politykę prywatności przed zbieraniem prawdziwych zgłoszeń.

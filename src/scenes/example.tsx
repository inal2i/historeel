import {makeScene2D, Rect, Txt, Circle} from '@motion-canvas/2d';
import {createRef, waitFor, tween, all, sequence, chain, easeInOutCubic, easeInOutExpo, easeOutBack} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  // Фиолетовый фон
  const background = createRef<Rect>();
  view.add(
      <Rect ref={background} size={view.size()} fill={'#8A2BE2'} />,
  );

  // Золотая надпись "Heelo World!"
  const text = createRef<Txt>();
  const textContent = "Heelo World!";

  view.add(
      <Txt
          ref={text}
          fontFamily="Arial, sans-serif"
          fontSize={64}
          fill={'#FFD700'}
          opacity={0} // Начинаем прозрачным
          textAlign="center"
          y={-100}
          text="" // Начинаем с пустого текста
      />
  );

  // Появление текста: сначала делаем видимым, потом побуквенно
  yield* text().opacity(1, 0.3, easeInOutCubic); // 🔥 Делаем текст видимым

  for (let i = 0; i <= textContent.length; i++) {
    yield* text().text(textContent.substring(0, i), 0.1, easeInOutCubic);
    if (i < textContent.length) {
      yield* waitFor(0.05);
    }
  }

  // Исчезновение текста с эффектом: масштаб вверх + прозрачность
  yield* all(
    text().scale(1.5, 1.0, easeOutBack),
    text().opacity(0, 1.5, easeInOutCubic),
    text().y(-150, 1.5, easeInOutCubic)
  );

  // Общая продолжительность сцены — 10 секунд
  const totalDuration = 10;
  const elapsed = 0.3 + textContent.length * 0.1 + (textContent.length - 1) * 0.05 + 1.5;

  if (elapsed < totalDuration) {
    yield* waitFor(totalDuration - elapsed);
  }
});
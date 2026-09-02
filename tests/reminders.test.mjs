import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createReadingReminderSchedule,
  formatReminderTime,
  READING_REMINDER_CONTENT,
} from '../src/features/reminders/model.ts';

const enabledAtEightThirty = { enabled: true, hour: 8, minute: 30 };

test('programa un aviso diario para un ritmo de siete días', () => {
  assert.deepEqual(createReadingReminderSchedule(enabledAtEightThirty, 'daily'), [
    { frequency: 'daily', hour: 8, minute: 30 },
  ]);
});

test('programa los días laborales para un ritmo de cinco días', () => {
  assert.deepEqual(
    createReadingReminderSchedule(enabledAtEightThirty, 'five').map(
      ({ weekday }) => weekday,
    ),
    [2, 3, 4, 5, 6],
  );
});

test('distribuye el ritmo de tres días durante la semana', () => {
  assert.deepEqual(
    createReadingReminderSchedule(enabledAtEightThirty, 'three').map(
      ({ weekday }) => weekday,
    ),
    [2, 4, 7],
  );
});

test('no programa avisos sin preferencia explícita o cuando se decide después', () => {
  assert.deepEqual(
    createReadingReminderSchedule({ ...enabledAtEightThirty, enabled: false }, 'daily'),
    [],
  );
  assert.deepEqual(createReadingReminderSchedule(enabledAtEightThirty, 'later'), []);
  assert.deepEqual(createReadingReminderSchedule(enabledAtEightThirty), []);
});

test('limita y presenta una hora local válida', () => {
  assert.equal(formatReminderTime({ enabled: true, hour: 80, minute: -3 }), '23:00');
});

test('el aviso utiliza texto general y no incorpora respuestas personales', () => {
  assert.deepEqual(READING_REMINDER_CONTENT, {
    body: 'Tu espacio de lectura está disponible cuando quieras volver.',
    title: 'Un momento para leer',
  });
});

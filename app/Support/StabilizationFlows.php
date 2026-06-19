<?php

namespace App\Support;

/**
 * The scripted, in-app guided stabilization flows shown to a client in crisis.
 *
 * Each flow shares one shape — intro (validation) screens → a "how do you feel
 * right now?" check → one guided path per feeling (steps + a calm closing) — so
 * a single React player renders any trauma type, and new ones are added here as
 * data with no new code. Content is authored from the founder's source scripts;
 * an admin editor can replace this class later without changing the player.
 *
 * @phpstan-type FlowStep array{title: string, lines: list<string>}
 * @phpstan-type FlowPath array{steps: list<FlowStep>, closing: list<string>}
 * @phpstan-type FlowOption array{key: string, label: string}
 * @phpstan-type Flow array{
 *     key: string,
 *     phase: string,
 *     label: string,
 *     summary: string,
 *     icon: string,
 *     intro: list<FlowStep>,
 *     check: array{question: string, options: list<FlowOption>},
 *     paths: array<string, FlowPath>,
 * }
 */
class StabilizationFlows
{
    /**
     * Every guided flow, keyed by trauma type.
     *
     * @return array<string, Flow>
     */
    public static function all(): array
    {
        return [
            'accident' => self::accident(),
        ];
    }

    /**
     * The lightweight cards shown on the emergency entry screen (no step content).
     *
     * @return list<array{key: string, label: string, summary: string, icon: string}>
     */
    public static function menu(): array
    {
        return array_values(array_map(
            fn (array $flow): array => [
                'key' => $flow['key'],
                'label' => $flow['label'],
                'summary' => $flow['summary'],
                'icon' => $flow['icon'],
            ],
            self::all(),
        ));
    }

    /**
     * Find a single flow by trauma type, or null if it isn't defined.
     *
     * @return Flow|null
     */
    public static function find(string $key): ?array
    {
        return self::all()[$key] ?? null;
    }

    /**
     * Accident / sudden shock — acute (just happened). Source: "accident- full".
     *
     * @return Flow
     */
    private static function accident(): array
    {
        return [
            'key' => 'accident',
            'phase' => 'acute',
            'label' => 'An accident or sudden shock',
            'summary' => 'A car accident, an injury, or witnessing something sudden and frightening.',
            'icon' => 'car',
            'intro' => [
                [
                    'title' => 'You’ve just been through something sudden',
                    'lines' => [
                        'You’ve just been through something sudden and overwhelming.',
                        'It’s normal for your mind and body to still feel shaken after this.',
                        'We’ll help you regain a sense of stability, step by step.',
                    ],
                ],
                [
                    'title' => 'You are safe enough to continue',
                    'lines' => [
                        'Right now, you don’t need to process everything that happened.',
                        'For this moment, you are here — and you are safe enough to continue.',
                    ],
                ],
            ],
            'check' => [
                'question' => 'Right now, you might feel…',
                'options' => [
                    ['key' => 'panic', 'label' => 'Very anxious or panicked'],
                    ['key' => 'frozen', 'label' => 'Shaken or frozen'],
                    ['key' => 'overthinking', 'label' => 'Thinking too much'],
                    ['key' => 'unsure', 'label' => 'I’m not sure'],
                ],
            ],
            'paths' => [
                'panic' => [
                    'steps' => [
                        [
                            'title' => 'Safety anchor',
                            'lines' => [
                                'Right now, focus on where you are.',
                                'You are not in immediate danger in this moment.',
                            ],
                        ],
                        [
                            'title' => 'Let your body know it’s over',
                            'lines' => [
                                'Your body may still be reacting as if the danger is happening right now.',
                                'But this moment is different — the danger is not here anymore.',
                            ],
                        ],
                        [
                            'title' => 'Full-body reset',
                            'lines' => [
                                'Press both feet firmly into the ground for five seconds.',
                                'Let your jaw loosen — let your teeth separate slightly.',
                                'Slowly drop your shoulders down.',
                                'Place one hand on your chest or stomach.',
                                'Notice your breath moving on its own, without changing it.',
                                'Gently stretch your fingers, or open and close your hands once.',
                            ],
                        ],
                        [
                            'title' => 'Steady your attention',
                            'lines' => [
                                'Look at one object in front of you.',
                                'Notice three details about it: its shape, its color, its texture.',
                                'Keep your eyes on it for a few moments.',
                                'If your mind drifts, gently bring it back to the object.',
                                'Silently remind yourself: “I am here, right now.”',
                            ],
                        ],
                    ],
                    'closing' => [
                        'Your body is beginning to settle back into safety.',
                    ],
                ],
                'frozen' => [
                    'steps' => [
                        [
                            'title' => 'This is your body protecting you',
                            'lines' => [
                                'After something sudden, the body can feel frozen or disconnected.',
                                'This is a normal response — not something wrong with you.',
                            ],
                        ],
                        [
                            'title' => 'Gently restart movement',
                            'lines' => [
                                'Start by moving just one part of your body — your fingers or toes.',
                                'Then shift your position slightly. A small movement is enough.',
                                'Roll your shoulders once, or gently tilt your head.',
                                'Press your feet into the ground for a moment, then release.',
                                'Notice: “I can still move, even a little.”',
                            ],
                        ],
                        [
                            'title' => 'Re-enter the world slowly',
                            'lines' => [
                                'Look around slowly, without searching for anything in particular.',
                                'Notice one thing that feels stable — an object, a wall, a light.',
                                'Let your eyes rest on it without effort.',
                                'Then notice one more detail about it — its color, shape, or position.',
                                'Remind yourself: “The world is still here, and I am here in it.”',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You’re gently reconnecting with yourself.',
                    ],
                ],
                'overthinking' => [
                    'steps' => [
                        [
                            'title' => 'Your mind is trying to make sense of it',
                            'lines' => [
                                'Your mind may be replaying or trying to understand what happened.',
                                'This is normal after a shock.',
                            ],
                        ],
                        [
                            'title' => 'A thought is not the event',
                            'lines' => [
                                'This is a thought — not something happening right now.',
                                'You don’t need to follow it.',
                            ],
                        ],
                        [
                            'title' => 'Let the loop loosen',
                            'lines' => [
                                'Imagine the thought moving a little further away from you.',
                                'You’re not pushing it away — just not holding onto it.',
                                'If it returns, gently label it again: “just a thought.”',
                                'Let your attention loosen around it, instead of fighting it.',
                            ],
                        ],
                        [
                            'title' => 'Refocus on right now',
                            'lines' => [
                                'Choose one object in your environment.',
                                'Look at it slowly for a few seconds.',
                                'Notice three simple details: its shape, its color, its texture.',
                                'If your mind pulls back, gently return to the object.',
                                'Say silently: “Right now, I am here.”',
                            ],
                        ],
                    ],
                    'closing' => [
                        'Not every thought needs your attention.',
                    ],
                ],
                'unsure' => [
                    'steps' => [
                        [
                            'title' => 'You don’t need to explain it',
                            'lines' => [
                                'That’s okay — you don’t need to explain how you feel.',
                                'Let your body be as it is right now, without fixing or analyzing anything.',
                            ],
                        ],
                        [
                            'title' => 'It’s okay if it’s unclear',
                            'lines' => [
                                'It’s okay if things feel unclear, heavy, or a little distant.',
                                'You might not be able to name what you feel — and that’s okay.',
                                'Sometimes after intense experiences, feelings don’t come in a clear way.',
                            ],
                        ],
                        [
                            'title' => 'Just be here',
                            'lines' => [
                                'Notice that you are here in this moment, even if things feel unclear.',
                                'Let your attention settle gently, without trying to guide it.',
                                'If thoughts or feelings appear, you don’t need to respond to them.',
                            ],
                        ],
                        [
                            'title' => 'A soft look around',
                            'lines' => [
                                'Slowly become aware of the space around you.',
                                'Notice one neutral detail — a light, a color, a shape.',
                                'Let your eyes rest there without effort.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You don’t need clarity right now — just being here is enough.',
                    ],
                ],
            ],
        ];
    }
}

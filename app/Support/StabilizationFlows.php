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
            'war' => self::war(),
            'grief' => self::grief(),
            'disaster' => self::disaster(),
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

    /**
     * War / conflict — acute. Source: "full-war".
     *
     * @return Flow
     */
    private static function war(): array
    {
        return [
            'key' => 'war',
            'phase' => 'acute',
            'label' => 'War or conflict',
            'summary' => 'Bombing, displacement, or living through violence and danger around you.',
            'icon' => 'war',
            'intro' => [
                [
                    'title' => 'You’re in a space to help you steady yourself',
                    'lines' => [
                        'You are in a space designed to help you stabilize after difficult or overwhelming experiences.',
                        'There is no right or wrong way to feel right now.',
                        'We’ll move step by step, based on what you need in this moment.',
                    ],
                ],
            ],
            'check' => [
                'question' => 'How do you feel right now?',
                'options' => [
                    ['key' => 'panic', 'label' => 'Panicked'],
                    ['key' => 'numb', 'label' => 'Numb'],
                    ['key' => 'overthinking', 'label' => 'Overthinking'],
                    ['key' => 'unsure', 'label' => 'I’m not sure'],
                ],
            ],
            'paths' => [
                'panic' => [
                    'steps' => [
                        [
                            'title' => 'Panic can pass',
                            'lines' => [
                                'Panic can happen when your body feels like it’s in danger, even when you are safe right now.',
                                'Let’s help your body slow down and feel more grounded.',
                            ],
                        ],
                        [
                            'title' => 'What you feel makes sense',
                            'lines' => [
                                'What you’re feeling makes sense after what you’ve been through.',
                                'Your body is reacting as if you need protection.',
                                'Right now, we’ll focus on helping it feel safe again.',
                            ],
                        ],
                        [
                            'title' => 'Let’s get through this moment',
                            'lines' => [
                                'Breathe in slowly… and out. Stay with this for about a minute.',
                                'Look around and name five things you can see.',
                                'Tell yourself: “I am safe right now.”',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You did something important. Even small steps help.',
                    ],
                ],
                'numb' => [
                    'steps' => [
                        [
                            'title' => 'Numbness is protection',
                            'lines' => [
                                'Feeling numb can happen after overwhelming experiences.',
                                'It’s your mind’s way of protecting you by slowing things down.',
                                'We’ll gently help you reconnect with the present.',
                            ],
                        ],
                        [
                            'title' => 'Gently reconnect',
                            'lines' => [
                                'Touch something cold, or hold something with texture — focus only on how it feels.',
                                'Move your body slowly for about a minute: stretch your arms, or roll your shoulders.',
                                'Name three things you can physically feel right now.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You’re reconnecting, little by little. That’s enough for now.',
                    ],
                ],
                'overthinking' => [
                    'steps' => [
                        [
                            'title' => 'Your mind is circling',
                            'lines' => [
                                'Overthinking is when your mind keeps repeating thoughts or worries.',
                                'It often happens after stress or uncertainty.',
                            ],
                        ],
                        [
                            'title' => 'This is normal',
                            'lines' => [
                                'Your mind is trying to make sense of things right now.',
                                'After stressful experiences, thoughts can start going in circles — that’s completely normal.',
                                'Let’s slow things down together.',
                            ],
                        ],
                        [
                            'title' => 'Clear the mental noise',
                            'lines' => [
                                'Write or say one thought that’s in your head right now — just one sentence, no analysis.',
                                'Say to yourself: “This is just a thought, not a fact.”',
                                'Look around and name three things you see, or focus on your breath for about a minute.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You don’t need to solve everything right now. Letting thoughts pass is also progress.',
                    ],
                ],
                'unsure' => [
                    'steps' => [
                        [
                            'title' => 'It’s okay not to know',
                            'lines' => [
                                'It’s okay if you’re not sure how you feel.',
                                'After difficult experiences, it can be hard to put it into words.',
                                'We’ll keep things simple and help you feel a bit more steady.',
                            ],
                        ],
                        [
                            'title' => 'A safe, simple reset',
                            'lines' => [
                                'Take a slow breath in… and out, for about a minute.',
                                'Look around and name three things you can see.',
                                'Feel your feet on the ground, or place a hand on your chest and notice your breath.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You don’t need the right words for what you feel. Coming here is already a step forward.',
                    ],
                ],
            ],
        ];
    }

    /**
     * Loss / grief — acute. Source: "full grief".
     *
     * @return Flow
     */
    private static function grief(): array
    {
        return [
            'key' => 'grief',
            'phase' => 'acute',
            'label' => 'Loss or grief',
            'summary' => 'The death of someone you love, or another deep loss that’s hard to bear.',
            'icon' => 'grief',
            'intro' => [
                [
                    'title' => 'We’ll stay with you, gently',
                    'lines' => [
                        'Loss can feel deeply painful, in many different ways.',
                        'There’s no right or wrong way to feel right now.',
                        'We’ll stay with you gently, step by step.',
                    ],
                ],
                [
                    'title' => 'Nothing needs to change right now',
                    'lines' => [
                        'Right now, we don’t need to change anything.',
                        'Let’s just take a moment together.',
                    ],
                ],
            ],
            'check' => [
                'question' => 'You might be feeling…',
                'options' => [
                    ['key' => 'sadness', 'label' => 'Deep sadness'],
                    ['key' => 'numb', 'label' => 'Emotional numbness'],
                    ['key' => 'overthinking', 'label' => 'Overthinking memories'],
                    ['key' => 'unsure', 'label' => 'I’m not sure'],
                ],
            ],
            'paths' => [
                'sadness' => [
                    'steps' => [
                        [
                            'title' => 'This is allowed',
                            'lines' => [
                                'It’s okay to feel this right now.',
                                'You don’t need to change it.',
                                'Whatever is here is allowed.',
                            ],
                        ],
                        [
                            'title' => 'Let it have a little space',
                            'lines' => [
                                'Say, or think: “This hurts.”',
                                'Notice what feels heavy right now.',
                                'If you can, write one sentence about what you miss.',
                            ],
                        ],
                        [
                            'title' => 'Let memories come and go',
                            'lines' => [
                                'It’s okay if memories come and go.',
                                'You don’t need to hold onto them right now.',
                                'Let them pass naturally, like waves.',
                            ],
                        ],
                        [
                            'title' => 'Come back to your body',
                            'lines' => [
                                'Feel your body resting where you are.',
                                'Notice the surface supporting you.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'Feeling sadness after loss is a natural response. You don’t need to push it away.',
                    ],
                ],
                'numb' => [
                    'steps' => [
                        [
                            'title' => 'It’s okay to feel numb',
                            'lines' => [
                                'It’s okay if you’re feeling numb right now.',
                                'Sometimes after loss, emotions can feel distant or quiet.',
                                'You don’t need to force anything.',
                            ],
                        ],
                        [
                            'title' => 'A little body awareness',
                            'lines' => [
                                'Notice the weight of your body where you’re sitting.',
                                'Or place a hand on your arm or chest and just notice the contact.',
                                'Feel the temperature of the air around you.',
                            ],
                        ],
                        [
                            'title' => 'A soft anchor',
                            'lines' => [
                                'Look at one thing around you, without trying to change anything.',
                                'Notice something neutral in your environment.',
                                'Even if you don’t feel much right now, that’s okay — feelings can return slowly, in their own time.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You don’t need to feel anything specific right now. Just being here is enough.',
                    ],
                ],
                'overthinking' => [
                    'steps' => [
                        [
                            'title' => 'Memories are surfacing',
                            'lines' => [
                                'It’s okay if memories are coming up.',
                                'The mind often tries to revisit things after loss.',
                            ],
                        ],
                        [
                            'title' => 'A gentle bit of distance',
                            'lines' => [
                                'This is a memory, not something happening now.',
                                'You don’t need to follow this thought fully.',
                                'It’s okay for thoughts to come and go.',
                            ],
                        ],
                        [
                            'title' => 'Let the thought soften',
                            'lines' => [
                                'Let the thought pass without holding it.',
                                'Notice one simple thing around you right now.',
                                'Feel your feet or hands, briefly.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You don’t need to solve or understand everything right now.',
                    ],
                ],
                'unsure' => [
                    'steps' => [
                        [
                            'title' => 'It’s okay not to know',
                            'lines' => [
                                'It’s okay not to know exactly what you’re feeling.',
                                'After loss, emotions can feel mixed or unclear.',
                            ],
                        ],
                        [
                            'title' => 'Foggy is okay',
                            'lines' => [
                                'Sometimes feelings don’t come in clear words.',
                                'It’s okay if everything feels a bit unclear right now.',
                                'You don’t need to figure anything out yet.',
                            ],
                        ],
                        [
                            'title' => 'Just be here',
                            'lines' => [
                                'Just notice where you are right now.',
                                'Notice your feet touching the ground, or one point of contact between your body and the surface.',
                                'You don’t have to carry everything at once — we’re here with you while you go through this.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'Whatever you’re feeling — or not feeling — is okay. You can take things at your own pace.',
                    ],
                ],
            ],
        ];
    }

    /**
     * Disaster — acute (just happened). Source: "Emergency first aid".
     *
     * @return Flow
     */
    private static function disaster(): array
    {
        return [
            'key' => 'disaster',
            'phase' => 'acute',
            'label' => 'A disaster or chaotic event',
            'summary' => 'An earthquake, fire, explosion, or other sudden, chaotic event around you.',
            'icon' => 'disaster',
            'intro' => [
                [
                    'title' => 'We’ll find stability, step by step',
                    'lines' => [
                        'Something overwhelming and chaotic may have just happened around you.',
                        'It’s normal to feel disoriented or shaken after situations like this.',
                        'We’ll help you find safety and stability, step by step.',
                    ],
                ],
            ],
            'check' => [
                'question' => 'How do you feel right now?',
                'options' => [
                    ['key' => 'panic', 'label' => 'Panic or fear'],
                    ['key' => 'confused', 'label' => 'Confused or disoriented'],
                    ['key' => 'numb', 'label' => 'Emotionally numb'],
                    ['key' => 'unsure', 'label' => 'I’m not sure'],
                ],
            ],
            'paths' => [
                'panic' => [
                    'steps' => [
                        [
                            'title' => 'Safety first',
                            'lines' => [
                                'First, make sure you are in a safe place right now.',
                                'If there is any immediate danger, move away — if it is safe to do so.',
                            ],
                        ],
                        [
                            'title' => 'Orient to where you are',
                            'lines' => [
                                'Look around and confirm where you are.',
                                'Notice what is currently stable, or not moving.',
                                'Try to identify one safe point in your surroundings.',
                            ],
                        ],
                        [
                            'title' => 'Steady your body',
                            'lines' => [
                                'Stand or sit in a steady position if you can.',
                                'Press your feet gently into the ground for support.',
                                'Let your body feel supported by the surface.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'Focus only on what helps you stay safe right now. Take things one step at a time.',
                    ],
                ],
                'confused' => [
                    'steps' => [
                        [
                            'title' => 'Disorientation is normal',
                            'lines' => [
                                'It’s normal to feel disoriented after something like this.',
                                'Your mind may need a moment to adjust to what just happened.',
                            ],
                        ],
                        [
                            'title' => 'Let your thoughts slow down',
                            'lines' => [
                                'Notice where you are right now.',
                                'You don’t need to think about everything that happened all at once.',
                                'Let your thoughts slow down a little.',
                            ],
                        ],
                        [
                            'title' => 'Rest on one fixed point',
                            'lines' => [
                                'Find one fixed point in your environment — something still and unchanged.',
                                'Rest your attention on it for a few seconds.',
                                'Let it help your mind settle slightly.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You don’t need to understand everything right now. Just take this moment step by step.',
                    ],
                ],
                'numb' => [
                    'steps' => [
                        [
                            'title' => 'Emotions can feel distant',
                            'lines' => [
                                'Sometimes after overwhelming events, emotions can feel distant, muted, or not fully available.',
                            ],
                        ],
                        [
                            'title' => 'A light reconnection',
                            'lines' => [
                                'Notice your body where it is resting or standing.',
                                'Feel the surface supporting you, without trying to change anything.',
                            ],
                        ],
                        [
                            'title' => 'Find something stable',
                            'lines' => [
                                'Look around and notice something that feels stable or normal right now.',
                                'Let your eyes rest on it, without needing to react or analyze it.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You don’t need to feel anything specific right now. Just being here in this moment is enough.',
                    ],
                ],
                'unsure' => [
                    'steps' => [
                        [
                            'title' => 'It’s okay if it’s unclear',
                            'lines' => [
                                'It’s okay not to know exactly how you feel right now.',
                                'After something overwhelming, your thoughts can feel unclear or scattered.',
                            ],
                        ],
                        [
                            'title' => 'A few slow breaths',
                            'lines' => [
                                'Take a slow breath in through your nose.',
                                'Let it out slowly through your mouth.',
                                'Repeat this a few times, at your own pace.',
                            ],
                        ],
                        [
                            'title' => 'A simple orientation',
                            'lines' => [
                                'Just notice where you are right now.',
                                'Look around and find one thing that feels stable or unchanged.',
                                'Let your eyes stay on it for a moment.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You don’t need to understand everything right now. Take things one step at a time, when you’re ready.',
                    ],
                ],
            ],
        ];
    }
}

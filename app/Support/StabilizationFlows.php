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
        if ($key === 'emergency') {
            return self::emergency();
        }

        return self::all()[$key] ?? null;
    }

    /**
     * Emergency First Aid — the single guided flow every visitor lands on when
     * they press the emergency button. Kept out of all() so it never appears as
     * an admin triage category; the four trauma types above remain for that.
     * Source: the founder's "Emergency first aid" script.
     *
     * @return Flow
     */
    public static function emergency(): array
    {
        return [
            'key' => 'emergency',
            'phase' => 'acute',
            'label' => 'Emergency First Aid',
            'summary' => 'Immediate, guided grounding for something that just happened.',
            'icon' => 'waves',
            'intro' => [
                [
                    'title' => 'We’ll take this together, step by step',
                    'lines' => [
                        'Something overwhelming and chaotic may have just happened around you.',
                        'It’s normal to feel disoriented or shaken after situations like this.',
                        'We’ll help you find safety and stability step by step.',
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
                            'title' => 'Safety check',
                            'lines' => [
                                'First, make sure you are in a safe place right now.',
                                'If there is any immediate danger, try to move away if it is safe to do so.',
                            ],
                        ],
                        [
                            'title' => 'Reality orientation',
                            'lines' => [
                                'Look around and confirm where you are.',
                                'Notice what is currently stable or not moving.',
                                'Try to identify one safe point in your surroundings.',
                            ],
                        ],
                        [
                            'title' => 'Body stability',
                            'lines' => [
                                'Stand or sit in a steady position if possible.',
                                'Press your feet gently into the ground for support.',
                                'Let your body feel supported by the surface.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'Focus only on what helps you stay safe right now.',
                        'Take things one step at a time.',
                        'Choose one thing that helps you feel safer, and stay with it.',
                    ],
                ],
                'confused' => [
                    'steps' => [
                        [
                            'title' => 'It’s normal to feel this way',
                            'lines' => [
                                'It’s normal to feel disoriented after something like this.',
                                'Your mind may need a moment to adjust to what just happened.',
                            ],
                        ],
                        [
                            'title' => 'Slow reality rebuild',
                            'lines' => [
                                'Notice where you are right now.',
                                'You don’t need to think about everything that happened all at once.',
                                'Let your thoughts slow down a little.',
                            ],
                        ],
                        [
                            'title' => 'A simple stability cue',
                            'lines' => [
                                'Find one fixed point in your environment — something still and unchanged.',
                                'Rest your attention on it for a few seconds.',
                                'Let it help your mind settle slightly.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You don’t need to understand everything right now.',
                        'Just take this moment step by step.',
                        'Start with what feels most important right now, even if it’s small.',
                    ],
                ],
                'numb' => [
                    'steps' => [
                        [
                            'title' => 'This is a normal response',
                            'lines' => [
                                'Sometimes after overwhelming events, emotions can feel distant, muted, or not fully available.',
                            ],
                        ],
                        [
                            'title' => 'Light body reconnection',
                            'lines' => [
                                'Notice your body where it is resting or standing.',
                                'Feel the surface supporting you without trying to change anything.',
                            ],
                        ],
                        [
                            'title' => 'Environment stability',
                            'lines' => [
                                'Look around and notice something that feels stable or normal right now.',
                                'Let your eyes rest on it without needing to react or analyze it.',
                                'Just let it be in your awareness for a moment.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You don’t need to feel anything specific right now.',
                        'Just being here in this moment is enough.',
                        'Continue focusing on one steady thing around you as you move through the next moments.',
                    ],
                ],
                'unsure' => [
                    'steps' => [
                        [
                            'title' => 'It’s okay not to know',
                            'lines' => [
                                'It’s okay not to know exactly how you feel right now.',
                                'After something overwhelming, your thoughts can feel unclear or scattered.',
                            ],
                        ],
                        [
                            'title' => 'A gentle breath',
                            'lines' => [
                                'Take a slow breath in through your nose.',
                                'Let it out slowly through your mouth.',
                                'Repeat this a few times, at your own pace.',
                            ],
                        ],
                        [
                            'title' => 'Neutral presence',
                            'lines' => [
                                'Just notice where you are right now.',
                                'You don’t need to figure anything out at this moment.',
                                'Let your attention rest where you are.',
                            ],
                        ],
                        [
                            'title' => 'Simple orientation',
                            'lines' => [
                                'Look around and find one thing that feels stable or unchanged.',
                                'Let your eyes stay on it for a moment.',
                                'You don’t need to analyze it.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You don’t need to understand everything right now.',
                        'Just take things one step at a time when you’re ready.',
                    ],
                ],
            ],
        ];
    }

    /**
     * Accident / sudden shock. Full transcription of "accident- full.docx".
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
                        'We’ll help you regain a sense of stability step by step.',
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
                            'title' => 'Your body may still be reacting',
                            'lines' => [
                                'Your body may still be reacting as if danger is happening right now.',
                                'But this moment is different, and the danger is not present anymore.',
                                'Let’s help your system settle down together.',
                            ],
                        ],
                        [
                            'title' => 'Full-body reset',
                            'lines' => [
                                'Press both feet firmly into the ground for five seconds.',
                                'Release your jaw — let your teeth separate slightly.',
                                'Drop your shoulders down slowly.',
                                'Place one hand on your chest or stomach.',
                                'Notice the natural movement of your breath, without changing it.',
                                'If you can, gently stretch your fingers, or open and close your hands once.',
                            ],
                        ],
                        [
                            'title' => 'Steady your attention',
                            'lines' => [
                                'Look at one object in front of you.',
                                'Slowly notice three details: its shape, its color, its texture or surface.',
                                'Keep your eyes on it for a few moments.',
                                'If your mind drifts, gently return to the object.',
                                'Remind yourself silently: “I am here, right now.”',
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
                            'title' => 'The body can feel frozen',
                            'lines' => [
                                'After something sudden, the body can feel frozen or disconnected.',
                            ],
                        ],
                        [
                            'title' => 'Gently restart your body',
                            'lines' => [
                                'Start by moving just one part of your body — your fingers or toes.',
                                'Then gently shift your position a little; no rush, a small movement is enough.',
                                'Roll your shoulders once, or gently tilt your head.',
                                'Press your feet into the ground for a moment, then release.',
                                'Notice: “I can still move, even a little.”',
                            ],
                        ],
                        [
                            'title' => 'Re-enter a stable world',
                            'lines' => [
                                'Look around slowly, without searching for anything specific.',
                                'Notice one thing that feels stable — an object, a wall, a surface, a light.',
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
                            'title' => 'Your mind may be replaying it',
                            'lines' => [
                                'Your mind may be replaying, or trying to understand, what happened.',
                            ],
                        ],
                        [
                            'title' => 'A thought is not the event',
                            'lines' => [
                                'This is a thought, not something happening right now.',
                                'You don’t need to follow it.',
                            ],
                        ],
                        [
                            'title' => 'Let the thought loosen',
                            'lines' => [
                                'Imagine the thought moving further away from you.',
                                'You are not pushing it away — just not holding it.',
                                'If it returns, gently label it again as “just a thought.”',
                                'Allow your attention to loosen around it, rather than fight it.',
                            ],
                        ],
                        [
                            'title' => 'Refocus on the present',
                            'lines' => [
                                'Choose one object in your environment.',
                                'Look at it slowly for a few seconds.',
                                'Notice three simple details: its shape, its color, its texture or surface.',
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
                            ],
                        ],
                        [
                            'title' => 'Let your body be as it is',
                            'lines' => [
                                'Pause for a moment.',
                                'Let your body be as it is right now.',
                                'You don’t need to fix, analyze, or change anything.',
                            ],
                        ],
                        [
                            'title' => 'Unclear feelings are okay',
                            'lines' => [
                                'It’s okay if things feel unclear, heavy, or slightly distant.',
                                'You might not be able to name what you feel — and that’s okay.',
                                'Sometimes after intense experiences, feelings don’t come in a clear way.',
                            ],
                        ],
                        [
                            'title' => 'Settle gently into this moment',
                            'lines' => [
                                'Notice that you are here in this moment, even if things feel unclear.',
                                'You don’t need to understand what is happening internally right now.',
                                'Let your attention settle gently, without trying to guide it.',
                                'If thoughts or feelings appear, you don’t need to respond to them.',
                                'Just allow this moment to exist without pressure.',
                            ],
                        ],
                        [
                            'title' => 'A light look around',
                            'lines' => [
                                'Slowly become aware of the space around you.',
                                'Notice one neutral detail in your environment — a light, a color, a shape, an object.',
                                'Let your eyes rest there without effort or pressure.',
                                'You don’t need to analyze it — just let it exist in your awareness.',
                                'If your attention moves away, that is completely fine.',
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
     * War / conflict. Full transcription of "full-war.docx".
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
                    'title' => 'A space to help you stabilize',
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
                    ['key' => 'panic', 'label' => 'Panic'],
                    ['key' => 'numb', 'label' => 'Numb'],
                    ['key' => 'overthinking', 'label' => 'Overthinking'],
                    ['key' => 'unsure', 'label' => 'I’m not sure'],
                ],
            ],
            'paths' => [
                'panic' => [
                    'steps' => [
                        [
                            'title' => 'Let’s help your body slow down',
                            'lines' => [
                                'Panic can happen when your body feels like it’s in danger, even if you are safe right now.',
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
                                'Breathe in slowly… and out. Stay with your breath for about a minute.',
                                'Look around and name five things you can see.',
                                'Tell yourself: “I am safe right now.”',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You did something important.',
                        'Even small steps help.',
                        'If you still feel overwhelmed, stay with slow breathing for a few seconds — and, if you can, reach out to someone you trust.',
                    ],
                ],
                'overthinking' => [
                    'steps' => [
                        [
                            'title' => 'Let’s calm it down',
                            'lines' => [
                                'Overthinking is when your mind keeps repeating thoughts or worries.',
                                'It often happens when you’ve been through stress or uncertainty.',
                            ],
                        ],
                        [
                            'title' => 'Your mind is making sense of things',
                            'lines' => [
                                'Your mind is trying to make sense of things right now.',
                                'After stressful experiences, thoughts can start going in circles — which is completely normal.',
                                'Let’s slow things down together.',
                            ],
                        ],
                        [
                            'title' => 'Clear the mental noise',
                            'lines' => [
                                'Write or say one thought that’s in your head right now — just one sentence, no analysis.',
                                'Say to yourself: “This is just a thought, not a fact.” Repeat it slowly two or three times.',
                                'Then choose one: name three things you can see, or focus on your breath for sixty seconds, or listen carefully to three sounds around you.',
                            ],
                        ],
                        [
                            'title' => 'If your mind is still racing',
                            'lines' => [
                                'Let’s pause the thinking for a moment.',
                                'Put both feet on the ground.',
                                'Take one slow breath in… and out.',
                                'Name one thing you can see right now.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You don’t need to solve everything right now.',
                        'Letting thoughts pass is also progress.',
                        'Your mind doesn’t need to solve everything at once — you can return to this anytime.',
                    ],
                ],
                'numb' => [
                    'steps' => [
                        [
                            'title' => 'Numbness is a form of protection',
                            'lines' => [
                                'Feeling numb can happen after overwhelming experiences.',
                                'It’s your mind’s way of protecting you by slowing things down.',
                                'We’ll gently help you reconnect with the present, step by step.',
                            ],
                        ],
                        [
                            'title' => 'Gently reconnect',
                            'lines' => [
                                'Touch something cold — water, metal, or a cold surface — or hold something with texture, like fabric or a wall. Focus only on how it feels.',
                                'Move your body slowly for about a minute — stretch your arms, roll your shoulders, or stand up and sit down once. No pressure, just movement.',
                                'Name three things you can physically feel right now — the chair under you, the air on your skin, your clothes on your body.',
                            ],
                        ],
                        [
                            'title' => 'If you still feel numb',
                            'lines' => [
                                'Let’s try something simpler.',
                                'Place your hand on your chest.',
                                'Take one slow breath in, and out.',
                                'Look around and notice one color.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You’re reconnecting, little by little.',
                        'Numbness can take time to fade — you don’t need to force anything.',
                        'Just coming here is already a step.',
                    ],
                ],
                'unsure' => [
                    'steps' => [
                        [
                            'title' => 'It’s okay not to be sure',
                            'lines' => [
                                'It’s okay if you’re not sure how you feel.',
                                'After difficult experiences, it can be hard to put it into words.',
                                'We’ll keep things simple and focus on helping you feel a bit more steady.',
                            ],
                        ],
                        [
                            'title' => 'You don’t need to explain anything',
                            'lines' => [
                                'You don’t need to explain anything.',
                                'We’ll just help you feel a little more steady.',
                            ],
                        ],
                        [
                            'title' => 'A simple, steady baseline',
                            'lines' => [
                                'Take a slow breath in… and out. Do this for about sixty seconds.',
                                'Look around and name three things you see.',
                                'Feel your feet on the ground, or place your hand on your chest and notice your breath.',
                            ],
                        ],
                        [
                            'title' => 'If nothing has shifted yet',
                            'lines' => [
                                'That’s okay. Let’s stay with something simple.',
                                'Take another slow breath, or look around and notice one thing you didn’t notice before.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You don’t need to have the right words for what you feel.',
                        'Coming here is already a step forward.',
                    ],
                ],
            ],
        ];
    }

    /**
     * Loss / grief. Full transcription of "full grief.docx".
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
                    'title' => 'We’ll stay with you gently',
                    'lines' => [
                        'Loss can feel deeply painful in many different ways.',
                        'There’s no right or wrong way to feel right now.',
                        'We’ll stay with you gently, step by step.',
                    ],
                ],
                [
                    'title' => 'Let’s just take a moment together',
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
                            'title' => 'Sadness is a natural response',
                            'lines' => [
                                'Feeling sadness after loss is a natural response.',
                                'You don’t need to push it away.',
                            ],
                        ],
                        [
                            'title' => 'Whatever is here is allowed',
                            'lines' => [
                                'It’s okay to feel this right now.',
                                'You don’t need to change it.',
                                'Whatever is here is allowed.',
                            ],
                        ],
                        [
                            'title' => 'Let it have some space',
                            'lines' => [
                                'Say, or think: “This hurts.”',
                                'Notice what feels heavy right now.',
                                'If it helps, write one sentence about what you miss.',
                            ],
                        ],
                        [
                            'title' => 'Let memories pass like waves',
                            'lines' => [
                                'It’s okay if memories come and go.',
                                'You don’t need to hold onto them right now.',
                                'Let them pass naturally, like waves.',
                            ],
                        ],
                        [
                            'title' => 'Return gently to now',
                            'lines' => [
                                'Feel your body resting where you are.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'Right now, you don’t need to change anything.',
                        'Just being here with it is enough.',
                    ],
                ],
                'numb' => [
                    'steps' => [
                        [
                            'title' => 'You don’t need to force anything',
                            'lines' => [
                                'It’s okay if you’re feeling numb right now.',
                                'Sometimes after loss, emotions can feel distant or quiet.',
                                'You don’t need to force anything.',
                            ],
                        ],
                        [
                            'title' => 'Light body awareness',
                            'lines' => [
                                'Choose one: notice the weight of your body where you’re sitting, place a hand on your arm or chest and just notice the contact, or feel the temperature of the air around you.',
                            ],
                        ],
                        [
                            'title' => 'A soft anchor to now',
                            'lines' => [
                                'Look at one thing around you, without trying to change anything.',
                                'Notice something neutral in your environment.',
                            ],
                        ],
                        [
                            'title' => 'Feelings can return in their own time',
                            'lines' => [
                                'Even if you don’t feel much right now, that’s okay.',
                                'Sometimes feelings return slowly, in their own time.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You don’t need to feel anything specific right now.',
                        'Just being here is enough.',
                    ],
                ],
                'overthinking' => [
                    'steps' => [
                        [
                            'title' => 'The mind revisits after loss',
                            'lines' => [
                                'It’s okay if memories are coming up.',
                                'The mind often tries to revisit things after loss.',
                            ],
                        ],
                        [
                            'title' => 'A little distance from the thought',
                            'lines' => [
                                'Choose one to tell yourself: “This is a memory, not something happening now,” or “I don’t need to follow this thought fully,” or “It’s okay for thoughts to come and go.”',
                            ],
                        ],
                        [
                            'title' => 'Let the thought pass',
                            'lines' => [
                                'Let the thought pass without holding it.',
                                'You don’t need to continue it right now.',
                            ],
                        ],
                        [
                            'title' => 'A very light shift to now',
                            'lines' => [
                                'Notice one simple thing around you right now.',
                                'Feel your feet or hands briefly.',
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
                            'title' => 'Feelings don’t always come in words',
                            'lines' => [
                                'Sometimes feelings don’t come in clear words.',
                                'It’s okay if everything feels a bit unclear right now.',
                                'You don’t need to figure anything out yet.',
                            ],
                        ],
                        [
                            'title' => 'Just be here for a moment',
                            'lines' => [
                                'Just notice where you are right now.',
                                'You don’t need to think about anything specific.',
                                'Let yourself just be here for a moment.',
                            ],
                        ],
                        [
                            'title' => 'A very light body anchor',
                            'lines' => [
                                'Notice your feet touching the ground or floor.',
                                'Notice the surface you are sitting or resting on.',
                                'Feel one point of contact between your body and the surface.',
                            ],
                        ],
                        [
                            'title' => 'You don’t have to carry it all at once',
                            'lines' => [
                                'You don’t have to carry everything at once.',
                                'It’s okay if this feels heavy, confusing, or hard.',
                                'We’re here with you while you go through this.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You don’t need to understand everything right now.',
                        'Whatever you’re feeling — or not feeling — is okay.',
                        'You can take things at your own pace.',
                    ],
                ],
            ],
        ];
    }

    /**
     * A disaster or chaotic event — post-event phase (1 week–1 month). Full
     * transcription of "paths through diaster.docx".
     *
     * @return Flow
     */
    private static function disaster(): array
    {
        return [
            'key' => 'disaster',
            'phase' => 'post-event',
            'label' => 'A disaster or chaotic event',
            'summary' => 'An earthquake, fire, explosion, or other sudden, chaotic event around you.',
            'icon' => 'disaster',
            'intro' => [
                [
                    'title' => 'It’s normal to still feel on edge',
                    'lines' => [
                        'After a large or frightening event, it’s normal for your mind and body to stay alert for some time.',
                        'Even when you are safe now, your system may still feel like it’s “on edge.”',
                        'This will gradually ease with time.',
                    ],
                ],
            ],
            'check' => [
                'question' => 'How have you been feeling lately?',
                'options' => [
                    ['key' => 'on_edge', 'label' => 'Still on edge or easily startled'],
                    ['key' => 'avoidance', 'label' => 'Avoiding reminders of what happened'],
                    ['key' => 'numb', 'label' => 'Emotionally numb or detached'],
                    ['key' => 'intrusive', 'label' => 'Thinking about the event often'],
                    ['key' => 'unsure', 'label' => 'I’m not sure'],
                ],
            ],
            'paths' => [
                'on_edge' => [
                    'steps' => [
                        [
                            'title' => 'The body stays watchful for a while',
                            'lines' => [
                                'After intense events, the body can stay in a “watchful” mode for a while.',
                            ],
                        ],
                        [
                            'title' => 'Re-orient to safety',
                            'lines' => [
                                'Notice that you are safe in this moment.',
                                'Look around and confirm that nothing is happening right now.',
                            ],
                        ],
                        [
                            'title' => 'A reality check for your body',
                            'lines' => [
                                'Right now, there is no immediate danger in this moment.',
                                'Your body may still be reacting as if something is happening, even when it isn’t.',
                            ],
                        ],
                        [
                            'title' => 'Let your body settle',
                            'lines' => [
                                'Let your shoulders or hands relax slightly.',
                                'Allow your body to rest a little more.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'Your body can slowly learn that it doesn’t need to stay on alert.',
                    ],
                ],
                'avoidance' => [
                    'steps' => [
                        [
                            'title' => 'Wanting to avoid reminders is normal',
                            'lines' => [
                                'It’s normal to want to avoid reminders after something overwhelming.',
                            ],
                        ],
                        [
                            'title' => 'At your own pace',
                            'lines' => [
                                'You don’t need to face anything before you’re ready.',
                                'You can approach reminders at your own pace.',
                            ],
                        ],
                        [
                            'title' => 'You are in control',
                            'lines' => [
                                'When you feel ready, you can choose one small step toward normal routines.',
                                'You are in control of how much, or how little, you engage.',
                            ],
                        ],
                        [
                            'title' => 'One small, familiar thing',
                            'lines' => [
                                'Do one small, familiar activity in your day — something safe and simple.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'You can return to things slowly, when it feels right — at your own pace.',
                    ],
                ],
                'numb' => [
                    'steps' => [
                        [
                            'title' => 'Emotions can feel distant',
                            'lines' => [
                                'Sometimes after big events, emotions can feel distant or less accessible.',
                            ],
                        ],
                        [
                            'title' => 'Low-pressure awareness',
                            'lines' => [
                                'Notice if anything feels even slightly present emotionally.',
                                'There’s no need to force any feeling.',
                            ],
                        ],
                        [
                            'title' => 'It’s okay to simply notice',
                            'lines' => [
                                'If any emotion appears, you don’t need to control it or push it away.',
                                'It’s okay to simply notice it for a moment.',
                            ],
                        ],
                        [
                            'title' => 'A small daily anchor',
                            'lines' => [
                                'Do one simple daily action — eat, walk, or rest.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'Emotions may return slowly, in their own time — there is no need to rush them.',
                    ],
                ],
                'intrusive' => [
                    'steps' => [
                        [
                            'title' => 'The mind revisits intense events',
                            'lines' => [
                                'It’s common for the mind to revisit parts of intense events afterward.',
                            ],
                        ],
                        [
                            'title' => 'A memory, not the event',
                            'lines' => [
                                'This is a memory, not something happening now.',
                                'You don’t need to stay with it.',
                            ],
                        ],
                        [
                            'title' => 'Let it pass',
                            'lines' => [
                                'Let the thought pass without engaging with it.',
                                'You don’t need to continue the story in your mind.',
                            ],
                        ],
                        [
                            'title' => 'Come back to now',
                            'lines' => [
                                'Gently bring your attention back to what you are doing right now.',
                                'You can focus on a simple current activity or sensation — sitting, walking, or holding something.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'Thoughts can come and go without needing your attention.',
                    ],
                ],
                'unsure' => [
                    'steps' => [
                        [
                            'title' => 'It’s okay if things feel unclear',
                            'lines' => [
                                'It’s okay if things still feel unclear after what happened.',
                            ],
                        ],
                        [
                            'title' => 'Just focus on small parts of the day',
                            'lines' => [
                                'You don’t need to understand everything right now.',
                                'Just focus on small parts of your day.',
                                'It’s also okay if you feel a bit tired, emotionally flat, or unmotivated.',
                            ],
                        ],
                        [
                            'title' => 'Even small choices are enough',
                            'lines' => [
                                'You can choose one small thing to do next — rest, eat, or move slightly.',
                                'Even small choices are enough right now.',
                                'You don’t need to pick the “perfect” option.',
                            ],
                        ],
                        [
                            'title' => 'One normal thing today',
                            'lines' => [
                                'Do one simple, normal activity today — rest, eat, or move slightly.',
                            ],
                        ],
                    ],
                    'closing' => [
                        'Clarity, energy, and stability can return gradually.',
                    ],
                ],
            ],
        ];
    }
}

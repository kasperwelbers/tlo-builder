export interface BloomLevel {
  code: string
  name: string
  description: string
  category: 'cognitive' | 'affective' | 'psychomotor'
}

export const BLOOM_LEVELS: BloomLevel[] = [
  // Cognitive — Revised Bloom's Taxonomy (Anderson & Krathwohl, 2001)
  {
    code: 'C1', name: 'Remembering', category: 'cognitive',
    description: 'Recalling facts and basic concepts. Verbs: define, list, memorize, repeat, state.',
  },
  {
    code: 'C2', name: 'Understanding', category: 'cognitive',
    description: 'Explaining ideas or concepts. Verbs: classify, describe, discuss, explain, identify, report.',
  },
  {
    code: 'C3', name: 'Applying', category: 'cognitive',
    description: 'Using information in new situations. Verbs: demonstrate, dramatize, interpret, operate, schedule, sketch.',
  },
  {
    code: 'C4', name: 'Analyzing', category: 'cognitive',
    description: 'Drawing connections among ideas. Verbs: differentiate, organize, relate, compare, contrast, examine.',
  },
  {
    code: 'C5', name: 'Evaluating', category: 'cognitive',
    description: 'Justifying a stand or decision. Verbs: appraise, argue, defend, judge, select, support, value, critique.',
  },
  {
    code: 'C6', name: 'Creating', category: 'cognitive',
    description: 'Producing new or original work. Verbs: design, assemble, construct, conjecture, develop, formulate.',
  },

  // Affective — Krathwohl, Bloom & Masia (1964)
  {
    code: 'A1', name: 'Receiving', category: 'affective',
    description: 'Willingness to hear or attend to information. Verbs: ask, choose, describe, follow, give, hold, identify.',
  },
  {
    code: 'A2', name: 'Responding', category: 'affective',
    description: 'Active participation and reacting to phenomena. Verbs: answer, assist, comply, discuss, greet, perform, practice.',
  },
  {
    code: 'A3', name: 'Valuing', category: 'affective',
    description: 'Attaching worth or value to an object, phenomenon, or behavior. Verbs: complete, demonstrate, differentiate, explain, follow, invite, join.',
  },
  {
    code: 'A4', name: 'Organizing', category: 'affective',
    description: 'Prioritizing values and resolving conflicts between them. Verbs: adhere, alter, arrange, combine, compare, defend, explain.',
  },
  {
    code: 'A5', name: 'Characterizing', category: 'affective',
    description: 'Internalizing values so they control behavior. Verbs: act, discriminate, display, influence, listen, modify, perform, propose.',
  },

  // Psychomotor — Simpson (1972)
  {
    code: 'P1', name: 'Perception', category: 'psychomotor',
    description: 'Using sensory cues to guide motor activity. Verbs: choose, describe, detect, distinguish, identify, isolate, select.',
  },
  {
    code: 'P2', name: 'Set', category: 'psychomotor',
    description: 'Readiness to act — mental, physical, and emotional. Verbs: begin, display, explain, move, proceed, react, state, volunteer.',
  },
  {
    code: 'P3', name: 'Guided Response', category: 'psychomotor',
    description: 'Learning complex skills through imitation or trial and error. Verbs: copy, follow, mimic, repeat, reproduce, trace.',
  },
  {
    code: 'P4', name: 'Mechanism', category: 'psychomotor',
    description: 'Performing a task in a confident, habitual manner. Verbs: assemble, calibrate, construct, dismantle, fasten, fix, grind.',
  },
  {
    code: 'P5', name: 'Complex Overt Response', category: 'psychomotor',
    description: 'Skillful and accurate performance of complex movements. Verbs: same as Mechanism, with qualifiers such as quickly, accurately, or efficiently.',
  },
  {
    code: 'P6', name: 'Adaptation', category: 'psychomotor',
    description: 'Modifying movements to fit special requirements or new situations. Verbs: adapt, alter, change, rearrange, reorganize, revise, vary.',
  },
  {
    code: 'P7', name: 'Origination', category: 'psychomotor',
    description: 'Creating new movement patterns to fit a specific situation or problem. Verbs: arrange, build, combine, compose, construct, create, design, initiate.',
  },
]

export const BLOOM_BY_CODE = Object.fromEntries(BLOOM_LEVELS.map(l => [l.code, l]))

export const BLOOM_CATEGORIES = [
  { key: 'cognitive'   as const, label: 'Cognitive (Anderson & Krathwohl, 2001)' },
  { key: 'affective'   as const, label: 'Affective (Krathwohl et al., 1964)'     },
  { key: 'psychomotor' as const, label: 'Psychomotor (Simpson, 1972)'            },
]

export const enum VALIDATION {
    MinQuestionDuration = 10,
    MaxQuestionDuration = 60,
    MinQuestionPoints = 10,
    MaxQuestionPoints = 100,
    MinQuestionChoices = 2,
    MaxQuestionChoices = 4,
    NotFoundIndex = -1,
}

export const enum SORTING {
    Equal = 0,
    FirstIsLess = -1,
    SecondIsLess = 1,
}

export const enum DURATION {
    OneSecMilliseconds = 1000,
    ThreeSecMilliseconds = 3000,
    FiveSecMilliseconds = 5000,
    ThreeSec = 3,
}

export const BONUS_MULTIPLIER = 0.2;
export const PERCENTAGE_MULTIPLIER = 100;

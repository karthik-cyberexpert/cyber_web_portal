
export interface QuestionOption {
    label: string;
    value: number;
}

export interface FeedbackQuestion {
    id: number;
    text: string;
    options: QuestionOption[];
}

export const FACULTY_FEEDBACK_QUESTIONS: FeedbackQuestion[] = [
    {
        id: 1,
        text: "How much of the syllabus was covered in the class?",
        options: [
            { label: "85-100%", value: 4 },
            { label: "70-84%", value: 3 },
            { label: "55-69%", value: 2 },
            { label: "30-54%", value: 1 },
            { label: "Below 30%", value: 0 }
        ]
    },
    {
        id: 2,
        text: "How well did the teachers prepare for the classes?",
        options: [
            { label: "Thoroughly", value: 4 },
            { label: "Satisfactorily", value: 3 },
            { label: "Poorly", value: 2 },
            { label: "Indifferently", value: 1 },
            { label: "Won’t teach at all", value: 0 }
        ]
    },
    {
        id: 3,
        text: "How well were the teachers able to communicate?",
        options: [
            { label: "Always effective", value: 4 },
            { label: "Sometimes effective", value: 3 },
            { label: "Just satisfactorily", value: 2 },
            { label: "Generally ineffective", value: 1 },
            { label: "Very poor communication", value: 0 }
        ]
    },
    {
        id: 4,
        text: "The teacher’s approach to teaching can best be described as",
        options: [
            { label: "Excellent", value: 4 },
            { label: "Very good", value: 3 },
            { label: "Good", value: 2 },
            { label: "Fair", value: 1 },
            { label: "Poor", value: 0 }
        ]
    },
    {
        id: 5,
        text: "The teachers illustrate the concepts through examples and applications.",
        options: [
            { label: "Every time", value: 4 },
            { label: "Usually", value: 3 },
            { label: "Occasionally/Sometimes", value: 2 },
            { label: "Rarely", value: 1 },
            { label: "Never", value: 0 }
        ]
    },
    {
        id: 6,
        text: "The teachers identify your strengths and encourage you with providing right level of challenges.",
        options: [
            { label: "Fully", value: 4 },
            { label: "Reasonably", value: 3 },
            { label: "Partially", value: 2 },
            { label: "Slightly", value: 1 },
            { label: "Unable to", value: 0 }
        ]
    },
    {
        id: 7,
        text: "Teachers are able to identify your weaknesses and help you to overcome them.",
        options: [
            { label: "Every time", value: 4 },
            { label: "Usually", value: 3 },
            { label: "Occasionally/Sometimes", value: 2 },
            { label: "Rarely", value: 1 },
            { label: "Never", value: 0 }
        ]
    },
    {
        id: 8,
        text: "The overall quality of teaching-learning process toward this teacher is very good.",
        options: [
            { label: "Strongly agree", value: 4 },
            { label: "Agree", value: 3 },
            { label: "Neutral", value: 2 },
            { label: "Disagree", value: 1 },
            { label: "Strongly disagree", value: 0 }
        ]
    }
];

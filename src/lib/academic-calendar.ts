
/**
 * Calculates the current academic year and semester based on the batch string and current date.
 * 
 * Logic:
 * - Batch duration: 4 Years (8 Semesters).
 * - Odd Semesters (1, 3, 5, 7): June (Month 5) to December (Month 11).
 * - Even Semesters (2, 4, 6, 8): January (Month 0) to May (Month 4).
 * 
 * @param batch The batch string in "YYYY-YYYY" format (e.g., "2024-2028").
 * @returns An object containing the current year (1-4) and semester (1-8).
 */
export function calculateCurrentAcademicState(batch: string): { year: number, semester: number } {
    if (!batch || !batch.includes('-')) {
        return { year: 1, semester: 1 }; // Default fallback
    }

    try {
        const startYear = parseInt(batch.split('-')[0]);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed (0 = Jan, 11 = Dec)

        const yearDiff = currentYear - startYear;

        let semester = 0;
        let year = 0;

        // If currently in June (5) or later => Odd Semester
        if (currentMonth >= 5) {
            semester = (yearDiff * 2) + 1;
            year = yearDiff + 1;
        } else {
            // Jan to May => Even Semester
            semester = yearDiff * 2;
            year = yearDiff; // Still in the previous academic year context effectively, but usually referred to as end of that year.
                             // Actually, logic defined: 
                             // Case 2: Jan 2026, Batch 2024. Diff = 2.
                             // Sem = 2*2 = 4. Year Level logic in plan was "Year Difference".
                             // Let's stick to the plan's logic exactly.
        }
        
        // Corrections / Clamping
        if (semester < 1) semester = 1;
        if (semester > 8) semester = 8;
        
        if (year < 1) year = 1;
        if (year > 4) year = 4;

        return { year, semester };

    } catch (e) {
        console.error("Error calculating academic state:", e);
        return { year: 1, semester: 1 };
    }
}

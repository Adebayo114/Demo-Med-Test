    export function getBpScore(bp) {
    if (typeof bp !== "string") return { score: 0, invalid: true };

    const parts = bp.split("/");
    if (parts.length !== 2) return { score: 0, invalid: true };

    const systolicStr = parts[0].trim();
    const diastolicStr = parts[1].trim();

    if (systolicStr === "" || diastolicStr === "") {
        return { score: 0, invalid: true };
    }

    const systolic = Number(systolicStr);
    const diastolic = Number(diastolicStr);

    if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) {
        return { score: 0, invalid: true };
    }

    if (systolic < 120 && diastolic < 80) return { score: 1, invalid: false };
    if (systolic >= 120 && systolic <= 129 && diastolic < 80)
        return { score: 2, invalid: false };
    if (
        (systolic >= 130 && systolic <= 139) ||
        (diastolic >= 80 && diastolic <= 89)
    ) return { score: 3, invalid: false };
    if (systolic >= 140 || diastolic >= 90)
        return { score: 4, invalid: false };

    return { score: 0, invalid: true };
    }

    export function getTempScore(temp) {
    const t = Number(temp);
    if (!Number.isFinite(t)) return { score: 0, invalid: true };
    if (t <= 99.5) return { score: 0, invalid: false };
    if (t <= 100.9) return { score: 1, invalid: false };
    return { score: 2, invalid: false };
    }

    export function getAgeScore(age) {
    const a = Number(age);
    if (!Number.isFinite(a)) return { score: 0, invalid: true };
    if (a <= 65) return { score: 1, invalid: false };
    return { score: 2, invalid: false };
    }

document.addEventListener("DOMContentLoaded", function () {
    const formatCurrency = (input) => {
        const value = parseFloat(input.value.replace(/[^\d.-]/g, ''));
        if (!isNaN(value)) {
            input.value = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(Math.round(value));
        }
    };

    const formatPercentage = (input) => {
        const value = parseFloat(input.value.replace(/[^\d.-]/g, ''));
        if (!isNaN(value)) {
            input.value = `${value}%`;
        }
    };

    const formatYears = (input) => {
        const value = parseInt(input.value.replace(/[^\d]/g, ''), 10);
        if (!isNaN(value)) {
            input.value = `${value} years`;
        }
    };

    const inputs = [
        { id: 'currentBalance', formatter: formatCurrency },
        { id: 'savingGoal', formatter: formatCurrency },
        { id: 'interestRate', formatter: formatPercentage },
        { id: 'savingTerm', formatter: formatYears },
    ];

    inputs.forEach(({ id, formatter }) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('blur', () => formatter(input));
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    updateResults();

    function setupEventListeners() {
        document.querySelectorAll('#currentBalance, #savingGoal, #frequency, #interestRate, #savingTerm').forEach(input => {
            input.addEventListener('input', updateResults);
        });

        document.getElementById('resetButton').addEventListener('click', () => {
            resetForm();
            updateResults();
        });

        document.getElementById('printButton').addEventListener('click', () => {
            window.print();
        });

        document.getElementById('assumptionsButton').addEventListener('click', openModal);
        document.getElementById('closeModal').addEventListener('click', closeModal);
        document.getElementById('closeButton').addEventListener('click', closeModal);

        window.addEventListener('click', function (event) {
            const modal = document.getElementById('assumptionModal');
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    function resetForm() {
        document.getElementById('currentBalance').value = '$10,000';
        document.getElementById('savingGoal').value = '$50,000';
        document.getElementById('frequency').value = 'monthly';
        document.getElementById('interestRate').value = '6%';
        document.getElementById('savingTerm').value = '10 year';
    }

    function openModal() {
        const modal = document.getElementById('assumptionModal');
        modal.style.display = 'block';
    }

    function closeModal() {
        const modal = document.getElementById('assumptionModal');
        modal.style.display = 'none';
    }

    function cleanInput(input) {
        return parseFloat(input.replace(/[^\d.-]/g, '')) || 0;
    }

    function updateResults() {
        const currentBalance = cleanInput(document.getElementById('currentBalance').value);
        const savingGoal = cleanInput(document.getElementById('savingGoal').value);
        const frequency = document.getElementById('frequency').value;
        const interestRate = cleanInput(document.getElementById('interestRate').value.replace('%', '')) / 100;
        const savingTerm = cleanInput(document.getElementById('savingTerm').value);

        let deposit, periodsPerYear;
        switch (frequency) {
            case 'weekly':
                periodsPerYear = 52;
                deposit = calculateDeposit(currentBalance, savingGoal, interestRate, savingTerm, periodsPerYear);
                break;
            case 'fortnightly':
                periodsPerYear = 26;
                deposit = calculateDeposit(currentBalance, savingGoal, interestRate, savingTerm, periodsPerYear);
                break;
            case 'monthly':
            default:
                periodsPerYear = 12;
                deposit = calculateDeposit(currentBalance, savingGoal, interestRate, savingTerm, periodsPerYear);
        }

        document.getElementById('deposit').textContent = `You need to deposit $${deposit.toFixed(2)} ${frequency} to reach your saving goal`;
        document.getElementById('totalDeposits').textContent = `${(currentBalance + (deposit * savingTerm * periodsPerYear)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
        document.getElementById('totalInterest').textContent = `${(savingGoal - currentBalance - (deposit * savingTerm * periodsPerYear)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
        document.getElementById('totalSavings').textContent = `${savingGoal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;

        updateChart(savingTerm, currentBalance, deposit, interestRate, periodsPerYear);
    }

    function calculateDeposit(currentBalance, savingGoal, interestRate, savingTerm, periodsPerYear) {
        const n = savingTerm * periodsPerYear;
        const r = interestRate / periodsPerYear;
        const futureValueFactor = (Math.pow(1 + r, n) - 1) / r * (1 + r);
        const deposit = (savingGoal - currentBalance * Math.pow(1 + r, n)) / futureValueFactor;
        return deposit;
    }

    function updateChart(savingTerm, currentBalance, deposit, interestRate, periodsPerYear) {
        const ctx = document.getElementById('savingsChart').getContext('2d');
        const dataWithExtra = calculateCumulativeDepositData(currentBalance, deposit, savingTerm, periodsPerYear);
        const dataWithoutExtra = calculateCumulativeInterestData(currentBalance, interestRate, deposit, savingTerm, periodsPerYear);

        if (window.savingsChart instanceof Chart) {
            window.savingsChart.destroy();
        }

        window.savingsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({ length: savingTerm + 1 }, (_, i) => i.toString()),
                datasets: [
                    {
                        label: 'Total Deposits',
                        data: dataWithExtra,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Total Interest',
                        data: dataWithoutExtra,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Years'
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Savings'
                        },
                        ticks: {
                            callback: function (value) {
                                if (value >= 1000) {
                                    return (value / 1000) + 'K';
                                }
                                return value;
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label;
                                const value = Math.round(context.raw).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
                                return `${label}: ${value}`;
                            },
                            title: function (context) {
                                return `Year: ${context[0].label}`;
                            }
                        },
                        displayColors: false
                    }
                }
            }
        });
    }

    function calculateCumulativeDepositData(currentBalance, deposit, savingTerm, periodsPerYear) {
        const data = [];
        let totalDeposit = currentBalance;
        data.push(totalDeposit);
        for (let i = 1; i <= savingTerm; i++) {
            totalDeposit += deposit * periodsPerYear;
            data.push(totalDeposit);
        }
        return data;
    }

    function calculateCumulativeInterestData(currentBalance, interestRate, deposit, savingTerm, periodsPerYear) {
        const data = [];
        let balance = currentBalance;
        let totalInterest = 0;
        data.push(totalInterest);
        for (let i = 1; i <= savingTerm; i++) {
            let yearlyInterest = 0;
            for (let j = 0; j < periodsPerYear; j++) {
                yearlyInterest += (balance + deposit) * (interestRate / periodsPerYear);
                balance += deposit;
                balance += (balance * (interestRate / periodsPerYear));
            }
            totalInterest += yearlyInterest;
            data.push(totalInterest);
        }
        return data;
    }

});

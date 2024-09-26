
let day = parseInt(localStorage.getItem('day')) || 1;
let level = parseFloat(localStorage.getItem('level')) || 1.0;
let streak = parseInt(localStorage.getItem('streak')) || 0;
let maxDays = 0;

const correctUsername = "hatim";
const correctPassword = "01223b834de65599084ab2dcd8db6de28c638a36925bae36844257194422d110";

function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

const savedStartDate = localStorage.getItem('startDate');
if (!savedStartDate) {
    document.getElementById('startDate').value = "";
} else {
    document.getElementById('startDate').value = savedStartDate;
    calculateMaxDays(savedStartDate);
    document.getElementById('startDate').disabled = true; // Disable input if a start date is set
}

function calculateMaxDays(startDate) {
    const start = new Date(startDate);
    const today = new Date();
    const timeDiff = today - start;
    maxDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    maxDays--;
}

function formatDate(date) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    const day = date.getDate();
    const daySuffix = (day > 3 && day < 21) ? 'th' : ['st', 'nd', 'rd', 'th'][day % 10] || 'th';
    const weekday = daysOfWeek[date.getDay()];
    const month = months[date.getMonth()];

    return `${weekday}, ${day}${daySuffix} ${month} ${date.getFullYear()}`;
}

function updateCurrentLoggingDate() {
    const startDateValue = document.getElementById('startDate').value;
    if (startDateValue) {
        const startDate = new Date(startDateValue);
        const currentLoggingDate = new Date(startDate);
        currentLoggingDate.setDate(startDate.getDate() + day - 1); // Add (day - 1) to the start date
        document.getElementById('currentLoggingDate').innerHTML = `${formatDate(currentLoggingDate)}`; // Use formatted date
    }
}

function updateDisplay() {
    document.getElementById('day').textContent = day;
    document.getElementById('level').textContent = level.toFixed(1);
    document.getElementById('streak').textContent = streak;
    updateProgressBar();
    saveProgress();

    const startDateValue = document.getElementById('startDate').value;
    const isValidDate = startDateValue && new Date(startDateValue) < new Date();

    if (!isValidDate || day > maxDays) {
        document.getElementById('successButton').disabled = true;
        document.getElementById('failureButton').disabled = true;
    } else {
        document.getElementById('successButton').disabled = false;
        document.getElementById('failureButton').disabled = false;
    }

    updateCurrentLoggingDate(); // Update the current logging date display
}

function saveProgress() {
    localStorage.setItem('day', day);
    localStorage.setItem('level', level);
    localStorage.setItem('streak', streak);
    localStorage.setItem('startDate', document.getElementById('startDate').value);
}

function clearProgress() {
    localStorage.removeItem('day');
    localStorage.removeItem('level');
    localStorage.removeItem('streak');
    localStorage.removeItem('startDate');
}

function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    const percentageText = document.getElementById('percentageText');
    const levelPercentage = (level / 10) * 100;
    const radius = 65;
    const circumference = 2 * Math.PI * radius;

    progressBar.style.strokeDasharray = `${circumference}`;
    progressBar.style.strokeDashoffset = `${circumference - (levelPercentage / 100 * circumference)}`;

    percentageText.textContent = levelPercentage.toFixed(0) + '%';
}

function showModal(message) {
    const modalMessage = document.getElementById('modal-message');
    const modal = document.getElementById('modal');

    modalMessage.textContent = message;
    modal.style.display = "block";
}

function showCongrats(bonus) {
    showModal(`Congratulations! ${bonus} Bonus Awarded.`);
}

function showCompletion() {
    showModal("Congratulations! Goal Achieved.");
}

document.getElementById('modal-close').onclick = function () {
    document.getElementById('modal').style.display = "none";
};

document.getElementById('modal-confirm').onclick = function () {
    document.getElementById('modal').style.display = "none";
};

document.getElementById('successButton').addEventListener('click', () => {
    if (level < 10.0) {
        level += 0.1;
        day++;
        streak++;

        let bonus = 0;

        if (streak === 7) {
            bonus = 0.2;
        } else if (streak === 10) {
            bonus = 0.2;
        } else if (streak === 14) {
            bonus = 0.5;
        } else if (streak === 21) {
            bonus = 0.5;
        } else if (streak === 28) {
            bonus = 0.5;
        } else if (streak % 7 === 0 && streak > 0) {
            bonus = 0.5;
        }

        if (bonus > 0) {
            level += bonus;
            showCongrats(bonus);
        }

        if (level >= 10.0) {
            level = 10.0;
            showCompletion();
        }

        updateDisplay();
    }
});

document.getElementById('failureButton').addEventListener('click', () => {
    level -= 0.1;
    if (level < 0) level = 0;
    day++;
    streak = 0;
    updateDisplay();
});

document.getElementById('resetButton').addEventListener('click', () => {
    document.getElementById('authModal').style.display = "block";
});

document.getElementById('confirmReset').addEventListener('click', () => {
    const username = document.getElementById('resetUsername').value;
    const password = document.getElementById('resetPassword').value;

    const hashedPassword = hashPassword(password);

    if (username === correctUsername && hashedPassword === correctPassword) {
        day = 1;
        level = 1.0;
        streak = 0;

        clearProgress();
        document.getElementById('startDate').value = "";
        document.getElementById('startDate').disabled = false;

        updateDisplay();
        document.getElementById('authModal').style.display = "none";
        savedStartDate = null;
    } else {
        alert("Incorrect username or password.");
    }

    document.getElementById('resetUsername').value = "";
    document.getElementById('resetPassword').value = "";
});

document.getElementById('cancelReset').addEventListener('click', () => {
    document.getElementById('authModal').style.display = "none";
    document.getElementById('resetUsername').value = "";
    document.getElementById('resetPassword').value = "";
});

document.getElementById('startDate').addEventListener('change', (event) => {
    document.getElementById('startDate').disabled = true;
    const startDate = event.target.value;
    localStorage.setItem('startDate', startDate);
    calculateMaxDays(startDate);
    day = 1;
    streak = 0;
    level = 1;
    updateDisplay();
});


updateDisplay();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/progress-tracker/service-worker.js').then(function (registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}


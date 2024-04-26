const eyeIcons = document.querySelectorAll(".eye-icon");
const passwordInput = document.querySelector('#password');
const repeatPasswordInput = document.querySelector('#repeat-password');
const submitPasswordButton = document.querySelector('button');
const mainComponent = document.querySelector('.main-component');
const searchParams = new URLSearchParams(window.location.search);

const resetPasswordObj = {
}

if(searchParams.has('email')){
    resetPasswordObj.email = searchParams.get('email');
}
if(searchParams.has('resetcode')){
    resetPasswordObj.resetPasswordCode = searchParams.get('resetcode');
}

function debounce(func, timeout = 1000){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

const modalData = {
    denied: {
        image: './images/denied_icon.png',
        message: 'Oops something went wrong.',
        description: 'Please retry',
        button: true
    },
    success: {
        image: './images/success_icon.png',
        message: 'Password changed!',
        description: 'Your password has been successfully changed.',
    },
    expired: {
        image: './images/expired_icon.png',
        message: 'Link expired!',
        description: 'This password reset link has expired. Please make a new password reset request from the app.'
    }
}

const createModal = (status) => {
    const { image, message, description, button } = modalData[status];
    const buttonHTML = button ? '<button type="button" class="close-btn">Close</button>' : '';
    return `<div class="modal">
                <div class="message ${status}">
                    <img src="${image}">
                    <h1>${message}</h1>
                    <p>${description}</p>
                    ${buttonHTML}
                </div>
            </div>`;
}

const handleModalClose = () => {
    const modal = document.querySelector('.modal');
    if (modal) modal.outerHTML = '';
}

const showPassword = (e) => {
    const passwordInput = e.target.parentNode.firstElementChild;
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
}

const resetPassword = async (resetPasswordObj) => {
    try {
        const response = await fetch("https://api-backoffice-demo.makeree.com/api/User/ResetPassword", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(resetPasswordObj)
        });
        return await response.json();
    } catch (error) {
        mainComponent.insertAdjacentHTML("afterend", createModal('denied'));
        throw error;
    }
}

const validatePassword = () => {
    const errorMessage = passwordInput.parentElement.nextElementSibling;
    const isPasswordValid = passwordInput.value.match(/^.{8,}$/);
    const arePasswordsMatching = passwordInput.value === repeatPasswordInput.value;

    if (errorMessage && errorMessage.tagName === 'P') {
        passwordInput.parentElement.classList.remove('invalid-input');
        repeatPasswordInput.parentElement.classList.remove('invalid-input');
        submitPasswordButton.disabled = false;
        errorMessage.remove();
    }

    if (!isPasswordValid) {
        passwordInput.parentElement.insertAdjacentHTML('afterend', '<p class="validation-failed">The password should contain at least 8 characters. Please retry.</p>');
        passwordInput.parentElement.classList.add('invalid-input');
        submitPasswordButton.disabled = true;
    } else if (!arePasswordsMatching) {
        repeatPasswordInput.parentElement.classList.add('invalid-input');
        passwordInput.parentElement.classList.add('invalid-input');
        passwordInput.parentElement.insertAdjacentHTML('afterend', '<p class="validation-failed">The passwords are not matching. Please retry.</p>');
        submitPasswordButton.disabled = true;
    }
};

const checkRequestStatus = (requestStatus) => {
    const errorMessages = {
        "-1": "Oops something went wrong. Please retry",
        "-2": "Oops something went wrong. Please retry",
        "-3": "Something went wrong",
        "-4": "Oops something went wrong. Please retry"
    };

    if (requestStatus === 0) {
        mainComponent.outerHTML = createModal('success');
    } else if (requestStatus === -5) {
        mainComponent.outerHTML = createModal('expired');
    } else {
        modalData['denied'].description = errorMessages[requestStatus] || 'Please retry';
        mainComponent.insertAdjacentHTML("afterend", createModal('denied'));
    }
}

const submitForm = async (event) => {
    event.preventDefault();
    if(passwordInput.value) {
        resetPasswordObj.newPassword = passwordInput.value;
        try {
            const requestStatus = await resetPassword(resetPasswordObj);
            checkRequestStatus(requestStatus.error);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    }
}

passwordInput.addEventListener('input', debounce(() => validatePassword()));
repeatPasswordInput.addEventListener('input', debounce(() => validatePassword()));
submitPasswordButton.addEventListener('click', submitForm);
eyeIcons.forEach(item => item.addEventListener('click', showPassword));

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('close-btn')) {
        handleModalClose();
    }
});

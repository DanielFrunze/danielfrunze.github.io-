const eyeIcons = document.querySelectorAll(".eye-icon");
const passwordInput = document.querySelector('#password');
const repeatPasswordInput = document.querySelector('#repeat-password');
const submitPasswordButton = document.querySelector('button');
const mainComponent = document.querySelector('.main-component');
const searchParams = new URLSearchParams(window.location.search);
const resetPasswordObj = {
    email: searchParams
}

const checkForRequiredParams = () => {
    if(searchParams.has('email') && searchParams.has('resetcode')){
        resetPasswordObj.email = searchParams.get('email');
        resetPasswordObj.resetPasswordCode = searchParams.get('resetcode');
        mainComponent.style.display = 'block'
    } else {
        modalData['expired'].description = 'Access denied'
        modalData['expired'].message = 'Access denied'
        mainComponent.outerHTML = createModal('expired');
    }
}

// function debounce(func, timeout = 1000){
//     let timer;
//     return (...args) => {
//         clearTimeout(timer);
//         timer = setTimeout(() => { func.apply(this, args); }, timeout);
//     };
// }

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

const togglePasswordVisibility = (event) => {
    const eyeIcon = event.target;
    const passwordInput = eyeIcon.parentNode.firstElementChild;

    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';

    if (passwordInput.type === 'text') {
        eyeIcon.src = './images/eye_open.png';
    } else {
        eyeIcon.src = './images/eye_closed.png';
    }
}

const resetPassword = async (resetPasswordObj) => {
    try {
        const response = await fetch("https://api-demo.makeree.com/api/v2/user/ResetPassword", {
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

const clearErrors = (...inputs) => {
    inputs.forEach(input => {
        const errorMessage = input.parentElement.parentElement.querySelector('.validation-failed');
        errorMessage?.remove();
        input.parentElement.classList.remove('invalid-input');
    });
}

const showError = (input, message) => {
    const errorHtml = `<p class="validation-failed">${message}</p>`;
    passwordInput.parentElement.insertAdjacentHTML('afterend', errorHtml);
    input.parentElement.classList.add('invalid-input');
}
const validatePassword = () => {
    const errorMessage = passwordInput.parentElement.parentElement.querySelector('.validation-failed');
    const isPasswordValid = passwordInput.value.match(/^.{8,}$/);
    const arePasswordsMatching = passwordInput.value === repeatPasswordInput.value;

    clearErrors(passwordInput, repeatPasswordInput);

    // Validate password length
    if (!isPasswordValid) {
        showError(passwordInput, 'The password should contain at least 8 characters.');
        submitPasswordButton.disabled = true;
    }
    // Validate passwords match
    else if (!arePasswordsMatching) {
        if(repeatPasswordInput.value) {
            showError(repeatPasswordInput, 'The passwords are not matching.');
            repeatPasswordInput.parentElement.classList.add('invalid-input');
        }
        submitPasswordButton.disabled = true;
    } else {
        submitPasswordButton.disabled = false;
    }
};


const checkRequestStatus = (requestStatus) => {
    const errorMessages = {
        "-1": "Oops something went wrong. Please retry",
        "-2": "Reset password details are incorrect. Please issue a new reset password request.",
        "-3": "Reset password details are incorrect. Please issue a new reset password request.",
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
    if(passwordInput.value && resetPasswordObj.resetPasswordCode && resetPasswordObj.email ) {
        resetPasswordObj.newPassword = md5(passwordInput.value);
        try {
            const requestStatus = await resetPassword(resetPasswordObj);
            checkRequestStatus(requestStatus.error);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    }
}

checkForRequiredParams()

passwordInput.addEventListener('input', validatePassword);
repeatPasswordInput.addEventListener('input',  validatePassword);
submitPasswordButton.addEventListener('click', submitForm);
eyeIcons.forEach(item => item.addEventListener('click', togglePasswordVisibility));

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('close-btn')) {
        handleModalClose();
    }
});

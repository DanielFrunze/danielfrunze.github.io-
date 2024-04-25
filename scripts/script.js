const eyeIcon = document.querySelectorAll(".eye-icon");
const passwordInput = document.querySelector('#password');
const repeatPasswordInput = document.querySelector('#repeat-password')
const submitPasswordButton = document.querySelector('button')
const mainComponent = document.querySelector('.main-component')

const modalData = {
    denied: {
        image: '../images/img_2.png',
        message: 'Password denied!',
        description: 'Error message',
        button: true
    },
    success: {
        image: '../images/img_3.png',
        message: 'Password changed!',
        description: 'Your password has been successfully changed.',
    },
    expired: {
        image: '../images/img_4.png',
        message: 'Link expired!',
        description: 'This password reset link has expired. Please make a new password reset request from the app.'
    }
}

const createModal = (status) => {
    const { image, message, description, button } = modalData[status];
    return(
        `<div class="notification">
        <div class="message ${status}">
            <img src="${image}">
            <h1>${message}</h1>
            <p>${description}</p>
            ${button ? '<button type="button" class="close-btn">Close</button>' : '' }
        </div>
    </div>`
    )
}

const handleModalClose = () => {
    const modal = document.querySelector('.notification')
    modal.outerHTML = '';
}
const showPassword = (e) => {
    const passwordInput = e.target.parentNode.firstElementChild;
    if(passwordInput.type === 'password')
        passwordInput.type = 'text'
    else passwordInput.type = 'password'
}

const resetPasswordObj = {
    email: 'frunze01@mail.ru',
    resetPasswordCode: "3uTf9Rd4qHHEtmHSAVsHtVjcKMe4CdzTHvn5W3uudNV5wtRHM4MRBvgtwqdkydW69y2vgUY3sxp9JGrCPx6duyqs8Aqf3z4Uf5mA",
    newPassword: 'qwerty123'
}

async function resetPassword(resetPasswordObj) {
    try {
        const response = await fetch("http://127.0.0.1:450/api/v2/User/ResetPassword", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(resetPasswordObj)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error resetting password:', error);
        // Handle errors appropriately depending on your application's needs
    }
}

const validatePassword = () => {
    const errorMessage = passwordInput.parentElement.nextElementSibling;
    if (errorMessage && errorMessage.tagName === 'P') {
        passwordInput.parentElement.classList.remove('invalid-input')
        repeatPasswordInput.parentElement.classList.remove('invalid-input')

        errorMessage.remove();
    }

    if (!passwordInput.value.match(/^.{8,}$/)) {
        passwordInput.parentElement.insertAdjacentHTML('afterend', '<p class="validation-failed">8 chars</p>');
        passwordInput.parentElement.classList.add('invalid-input');
    } else if (passwordInput.value !== repeatPasswordInput.value) {
        repeatPasswordInput.parentElement.classList.add('invalid-input');
        passwordInput.parentElement.classList.add('invalid-input');
        passwordInput.parentElement.insertAdjacentHTML('afterend', '<p class="validation-failed">not match</p>');
    }
};


const submitForm = async () => {
    this.event.preventDefault()
    const passwordLength = /^.{8,}$/
    if(!passwordInput.value.match(passwordLength)) {
        modalData['denied'].description = 'The password should contain at least 8 characters. Please retry.';
        mainComponent.insertAdjacentHTML("afterend", createModal('denied'));
    }
    else if(passwordInput.value !== repeatPasswordInput.value){
        modalData['denied'].description = 'The passwords are not matching. Please retry.';
        mainComponent.insertAdjacentHTML("afterend", createModal('denied'));
    } else {
        // const response = fetch("http://127.0.0.1:450/api/v2/User/ResetPassword", {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json;charset=utf-8'
        //     },
        //     body: JSON.stringify(resetPasswordObj)
        // }).then(data => {return data.json()})
        //     .then(res => res)
        const requestStatus = await resetPassword(resetPasswordObj);
        switch (requestStatus.error){
            case 0: {
                mainComponent.outerHTML = createModal('success')
                break;
            }
            case -1: {
                modalData['denied'].message = 'Oops something went wrong.'
                modalData['denied'].description = 'Please retry';
                mainComponent.insertAdjacentHTML("afterend", createModal('denied'));
                break;
            }
            case -2: {
                modalData['denied'].message = 'Oops something went wrong.'
                modalData['denied'].description = 'Please retry';
                mainComponent.insertAdjacentHTML("afterend", createModal('denied'));
            }
            case -3: {
                modalData['denied'].description = 'Something went wrong';
                mainComponent.insertAdjacentHTML("afterend", createModal('denied'));
                break;
            }
            case -4: {
                modalData['denied'].message = 'Oops something went wrong.'
                modalData['denied'].description = 'Please retry';
                mainComponent.insertAdjacentHTML("afterend", createModal('denied'));
                break;
            }
            case -5: {
                mainComponent.outerHTML = createModal('expired')
                break;
            }
        }
        // mainComponent.insertAdjacentHTML("afterend", createModal(modalData['success']));
    }

    const notificationCloseBtn = document.querySelector('.close-btn')
    if (notificationCloseBtn){
        console.log(notificationCloseBtn)
        notificationCloseBtn.addEventListener('click', handleModalClose)
    }
}
passwordInput.addEventListener('focusout', validatePassword)
repeatPasswordInput.addEventListener('focusout', validatePassword)

submitPasswordButton.addEventListener('click', submitForm)
eyeIcon.forEach(item => {item.addEventListener('click',showPassword)})
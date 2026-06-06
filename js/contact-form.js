// ===== ФОРМА ОБРАТНОЙ СВЯЗИ =====
document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('formSubmitBtn');
    if (!submitBtn) return;
    
    function showFormMessage(message, isError = false) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = isError ? '#dc2626' : '#048F4C';
        toast.style.color = 'white';
        toast.style.padding = '12px 28px';
        toast.style.borderRadius = '60px';
        toast.style.fontWeight = '500';
        toast.style.zIndex = '1000';
        toast.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    submitBtn.onclick = function() {
        const name = document.getElementById('formName')?.value.trim();
        const email = document.getElementById('formEmail')?.value.trim();
        const phone = document.getElementById('formPhone')?.value.trim();
        const message = document.getElementById('formMessage')?.value.trim();
        
        if (!name) {
            showFormMessage('❌ Пожалуйста, укажите ваше имя', true);
            return;
        }
        
        if (!email || !email.includes('@')) {
            showFormMessage('❌ Пожалуйста, укажите корректный e-mail', true);
            return;
        }
        
        // Здесь можно отправить данные на сервер
        console.log('Заявка отправлена:', { name, email, phone, message });
        
        let responseMessage = `✨ Спасибо, ${name}! Менеджер свяжется с вами в течение часа.`;
        if (email) responseMessage += ` Чек-лист отправлен на ${email}.`;
        showFormMessage(responseMessage);
        
        // Очистка формы
        document.getElementById('formName').value = '';
        document.getElementById('formEmail').value = '';
        document.getElementById('formPhone').value = '';
        document.getElementById('formMessage').value = '';
    };
});

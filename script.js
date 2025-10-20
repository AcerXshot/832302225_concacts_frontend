const API_BASE_URL = 'http://127.0.0.1:5000/api';

// 获取页面元素
const contactsList = document.getElementById('contacts-list');
const addContactForm = document.getElementById('add-contact-form');
const nameInput = document.getElementById('name-input');
const phoneInput = document.getElementById('phone-input');

// 获取修改弹窗的元素
const editModal = document.getElementById('edit-modal');
const editContactForm = document.getElementById('edit-contact-form');
const editIdInput = document.getElementById('edit-id-input');
const editNameInput = document.getElementById('edit-name-input');
const editPhoneInput = document.getElementById('edit-phone-input');

// --- 【核心函数1】获取并渲染所有联系人 ---
function fetchAndRenderContacts() {
  fetch(`${API_BASE_URL}/contacts`)
    .then(response => response.json())
    .then(contacts => {
      contactsList.innerHTML = '';
      contacts.forEach(contact => {
        const li = document.createElement('li');
        li.textContent = `姓名: ${contact.name}, 电话: ${contact.phone}`;

        // --- 新增：修改按钮 ---
        const editButton = document.createElement('button');
        editButton.textContent = '修改';
        editButton.onclick = () => showEditForm(contact); // 点击时调用显示函数
        li.appendChild(editButton);

        // 删除按钮
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '删除';
        deleteButton.onclick = () => deleteContact(contact.id);
        li.appendChild(deleteButton);

        contactsList.appendChild(li);
      });
    })
    .catch(error => console.error('获取联系人失败:', error));
}

// --- 【核心函数2】删除联系人 ---
function deleteContact(id) {
  fetch(`${API_BASE_URL}/contacts/${id}`, { method: 'DELETE' })
    .then(response => {
      if (response.ok) fetchAndRenderContacts();
      else console.error('删除失败');
    })
    .catch(error => console.error('请求出错:', error));
}

// --- 【新增函数3】显示并填充修改表单 ---
function showEditForm(contact) {
  editIdInput.value = contact.id;
  editNameInput.value = contact.name;
  editPhoneInput.value = contact.phone;
  editModal.style.display = 'block';
}

// --- 【新增函数4】隐藏修改表单 ---
function hideEditForm() {
  editModal.style.display = 'none';
}

// --- 【监听器1】监听“添加”表单的提交 ---
addContactForm.addEventListener('submit', event => {
  event.preventDefault();
  fetch(`${API_BASE_URL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nameInput.value, phone: phoneInput.value })
  }).then(response => {
    if (response.ok) {
      nameInput.value = '';
      phoneInput.value = '';
      fetchAndRenderContacts();
    } else {
      console.error('添加失败');
    }
  }).catch(error => console.error('请求出错:', error));
});

// --- 【新增监听器2】监听“修改”表单的提交 ---
editContactForm.addEventListener('submit', event => {
  event.preventDefault();
  const id = editIdInput.value;
  const updatedContact = {
    name: editNameInput.value,
    phone: editPhoneInput.value
  };

  fetch(`${API_BASE_URL}/contacts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedContact)
  }).then(response => {
    if (response.ok) {
      hideEditForm(); // 成功后隐藏表单
      fetchAndRenderContacts(); // 并刷新列表
    } else {
      console.error('修改失败');
    }
  }).catch(error => console.error('请求出错:', error));
});


// --- 页面首次加载时，立即执行一次获取和渲染操作 ---
document.addEventListener('DOMContentLoaded', fetchAndRenderContacts);

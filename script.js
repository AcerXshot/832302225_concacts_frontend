const API_BASE_URL = 'https://eight32302225-backend.onrender.com/api';

// 获取页面元素
const contactsTbody = document.getElementById('contacts-tbody');
const addContactForm = document.getElementById('add-contact-form');
const nameInput = document.getElementById('name-input');
const phoneInput = document.getElementById('phone-input');

// 获取修改弹窗的元素
const editModal = document.getElementById('edit-modal');
const editContactForm = document.getElementById('edit-contact-form');
const editIdInput = document.getElementById('edit-id-input');
const editNameInput = document.getElementById('edit-name-input');
const editPhoneInput = document.getElementById('edit-phone-input');

//--- 【核心函数1】获取并渲染所有联系人 ---
function fetchAndRenderContacts() {
  fetch(`${API_BASE_URL}/contacts`)
    .then(response => response.json())
    .then(contacts => {
      // 清空表格内容
      contactsTbody.innerHTML = '';

      contacts.forEach(contact => {
        // 创建一个新的表格行 <tr>
        const row = contactsTbody.insertRow();

        // 创建单元格 <td> 并填充内容
        const nameCell = row.insertCell();
        nameCell.textContent = contact.name;

        const phoneCell = row.insertCell();
        phoneCell.textContent = contact.phone;

        const actionsCell = row.insertCell();

        // 创建修改按钮
        const editButton = document.createElement('button');
        editButton.textContent = '修改';
        editButton.className = 'outline'; // Pico.css 的次要按钮样式
        editButton.onclick = () => showEditForm(contact);

        // 创建删除按钮
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '删除';
        deleteButton.className = 'secondary'; // Pico.css 的警告/删除按钮样式
        deleteButton.onclick = () => deleteContact(contact.id);

        // 把按钮放进操作单元格
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
      });
    })
    .catch(error => console.error('获取联系人失败:', error));
}

// --- 【核心函数2】删除联系人 ---
function deleteContact(id) {
  // 增加一个确认弹窗，防止误删
  if (!confirm('您确定要删除这位联系人吗？')) {
    return; // 如果用户点击“取消”，则什么也不做
  }

  fetch(`${API_BASE_URL}/contacts/${id}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (response.ok) {
        // 删除成功后，再次刷新列表
        fetchAndRenderContacts();
      } else {
        console.error('删除失败');
        alert('删除失败，请稍后再试。'); // 给用户一个友好的失败提示
      }
    })
    .catch(error => {
      console.error('请求出错:', error);
      alert('请求出错，请检查网络或联系管理员。');
    });
}

// --- 【新增函数3】显示并填充修改表单 ---
function showEditForm(contact) {
  editIdInput.value = contact.id;
  editNameInput.value = contact.name;
  editPhoneInput.value = contact.phone;
  editModal.showModal(); // 这是 <dialog> 元素的标准显示方法
}

// --- 【新增函数4】隐藏修改表单 ---
function hideEditForm() {
  editModal.close(); // 这是 <dialog> 元素的标准关闭方法
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

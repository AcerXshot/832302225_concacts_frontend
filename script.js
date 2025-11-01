//* global pinyinPro */ // 告诉 IDE pinyinPro 是全局变量

// --- 全局变量 ---
const API_BASE_URL = 'https://eight32302225-backend.onrender.com/api';
const CONTACTS_PER_PAGE = 6;
let allContacts = [];
let currentPage = 1;
let selectedContact = null;

// --- 获取页面元素 ---
const searchInput = document.getElementById('search-input');
const contactsListDiv = document.getElementById('contacts-list');
const pageInfo = document.getElementById('page-info');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');

// 添加模态框
const addModal = document.getElementById('add-modal');
const addContactForm = document.getElementById('add-contact-form');
const nameInput = document.getElementById('name-input');
const phoneInput = document.getElementById('phone-input');
const emailInput = document.getElementById('email-input'); // (新增)

// 修改模态框
const editModal = document.getElementById('edit-modal');
const editContactForm = document.getElementById('edit-contact-form');
const editIdInput = document.getElementById('edit-id-input');
const editNameInput = document.getElementById('edit-name-input');
const editPhoneInput = document.getElementById('edit-phone-input');
const editEmailInput = document.getElementById('edit-email-input'); // (新增)

// 详情模态框
const detailModal = document.getElementById('detail-modal');
const detailName = document.getElementById('detail-name');
const detailPhone = document.getElementById('detail-phone');
const detailEmail = document.getElementById('detail-email'); // (新增)
const detailEditBtn = document.getElementById('detail-edit-btn');
const detailDeleteBtn = document.getElementById('detail-delete-btn');

// =================================================================
// --- 核心渲染流程 ---
// =================================================================

// 1. 主函数：获取数据并触发渲染
async function fetchDataAndRender() {
  try {
    const response = await fetch(`${API_BASE_URL}/contacts`);
    allContacts = await response.json();
    currentPage = 1;
    updateSearchPlaceholder(); // 2. (已修改) 更新搜索框占位符
    renderPage();
  } catch (error) {
    console.error('获取联系人失败:', error);
    contactsListDiv.innerHTML = '<p>加载数据失败，请检查网络连接。</p>';
  }
}

// 2. 渲染函数：过滤、排序、分页、分组、渲染
function renderPage() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredContacts = allContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm) ||
    contact.phone.includes(searchTerm) ||
    (contact.email && contact.email.toLowerCase().includes(searchTerm)) // (新增) 搜索 email
  );

  filteredContacts.sort((a, b) => {
    return pinyinPro.pinyin(a.name, { toneType: 'none' }).localeCompare(pinyinPro.pinyin(b.name, { toneType: 'none' }));
  });

  const startIndex = (currentPage - 1) * CONTACTS_PER_PAGE;
  const endIndex = startIndex + CONTACTS_PER_PAGE;
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

  const groupedContacts = groupContacts(paginatedContacts);
  renderGroupedContacts(groupedContacts);
  updatePaginationControls(filteredContacts.length);
}

// =================================================================
// --- 辅助函数 ---
// =================================================================

// 分组 (保持不变)
function groupContacts(contacts) {
  if (contacts.length === 0) return {};
  const groups = {};
  contacts.forEach(contact => {
    let firstLetter = pinyinPro.pinyin(contact.name, { pattern: 'first', toneType: 'none' }).toUpperCase();
    if (!/^[A-Z]$/.test(firstLetter)) firstLetter = '#';
    if (!groups[firstLetter]) groups[firstLetter] = [];
    groups[firstLetter].push(contact);
  });
  return groups;
}

// 渲染分组 (保持不变)
function renderGroupedContacts(groupedContacts) {
  contactsListDiv.innerHTML = '';
  const groupKeys = Object.keys(groupedContacts).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });

  if (groupKeys.length === 0) {
    contactsListDiv.innerHTML = '<p style="text-align: center; margin-top: 2rem;">没有找到符合条件的联系人。</p>';
    return;
  }

  groupKeys.forEach(key => {
    const header = document.createElement('h3');
    header.className = 'list-group-header';
    header.textContent = key;
    contactsListDiv.appendChild(header);

    groupedContacts[key].forEach(contact => {
      const contactItem = document.createElement('div');
      contactItem.className = 'contact-item';
      contactItem.textContent = contact.name;
      contactItem.dataset.id = contact.id;
      contactsListDiv.appendChild(contactItem);
    });
  });
}

// 更新分页 (保持不变)
function updatePaginationControls(totalItems) {
  const totalPages = Math.ceil(totalItems / CONTACTS_PER_PAGE) || 1;
  pageInfo.textContent = `第 ${currentPage} / ${totalPages} 页`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage >= totalPages;
}

// 2. (已修改) 更新搜索框占位符
function updateSearchPlaceholder() {
  searchInput.placeholder = `在 ${allContacts.length} 位联系人中搜索...`;
}

// =================================================================
// --- 模态框控制 ---
// =================================================================

// 添加模态框
function showAddModal() { addModal.showModal(); }
function hideAddModal() { addModal.close(); }

// 修改模态框 (已更新, 增加 email)
function showEditForm(contact) {
  selectedContact = contact;
  editIdInput.value = contact.id;
  editNameInput.value = contact.name;
  editPhoneInput.value = contact.phone;
  editEmailInput.value = contact.email || ''; // (新增)
  editModal.showModal();
}
function hideEditForm() { editModal.close(); }

// 详情模态框 (已更新, 增加 email)
function showDetailModal(contact) {
  selectedContact = contact;
  detailName.textContent = contact.name;
  detailPhone.textContent = contact.phone;
  detailEmail.textContent = contact.email || '未设置'; // (新增)
  detailModal.showModal();
}
function hideDetailModal() { detailModal.close(); }

// =================================================================
// --- 事件监听器 ---
// =================================================================

document.addEventListener('DOMContentLoaded', fetchDataAndRender);
searchInput.addEventListener('input', () => {
  currentPage = 1;
  renderPage();
});
prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) { currentPage--; renderPage(); }
});
nextPageBtn.addEventListener('click', () => {
  const totalItems = allContacts.filter(c => c.name.toLowerCase().includes(searchInput.value.toLowerCase()) || c.phone.includes(searchInput.value)).length;
  const totalPages = Math.ceil(totalItems / CONTACTS_PER_PAGE) || 1;
  if (currentPage < totalPages) { currentPage++; renderPage(); }
});

// 列表项点击
contactsListDiv.addEventListener('click', (event) => {
  const target = event.target;
  if (target.classList.contains('contact-item')) {
    const contactId = target.dataset.id;
    // 修复了之前版本中的一个小 bug，使用 Number() 来确保类型匹配
    const contact = allContacts.find(c => c.id === Number(contactId));
    if (contact) { showDetailModal(contact); }
  }
});

// 详情模态框按钮
detailEditBtn.addEventListener('click', () => {
  hideDetailModal();
  showEditForm(selectedContact);
});
detailDeleteBtn.addEventListener('click', () => {
  hideDetailModal();
  deleteContact(selectedContact.id);
});

// 添加表单提交 (已更新, 增加 email)
addContactForm.addEventListener('submit', event => {
  event.preventDefault();
  fetch(`${API_BASE_URL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: nameInput.value,
      phone: phoneInput.value,
      email: emailInput.value // (新增)
    })
  }).then(response => {
    if (response.ok) {
      hideAddModal();
      addContactForm.reset();
      fetchDataAndRender();
    } else { alert('添加失败'); }
  });
});

// 修改表单提交 (已更新, 增加 email)
editContactForm.addEventListener('submit', event => {
  event.preventDefault();
  const id = editIdInput.value;
  const updatedContact = {
    name: editNameInput.value,
    phone: editPhoneInput.value,
    email: editEmailInput.value // (新增)
  };
  fetch(`${API_BASE_URL}/contacts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedContact)
  }).then(response => {
    if (response.ok) {
      hideEditForm();
      fetchDataAndRender();
    } else { alert('修改失败'); }
  });
});

// 删除函数 (保持不变)
function deleteContact(id) {
  if (!confirm(`您确定要删除 ${selectedContact.name} 吗？`)) return;
  fetch(`${API_BASE_URL}/contacts/${id}`, { method: 'DELETE' })
    .then(response => {
      if (response.ok) { fetchDataAndRender(); }
      else { alert('删除失败'); }
    });
}


// --- 全局变量和常量 ---
const API_BASE_URL = 'https://eight32302225-backend.onrender.com/api';
const CONTACTS_PER_PAGE = 15; // 每页显示的联系人数量

let allContacts = []; // 用于缓存从后端获取的所有联系人，避免重复请求
let currentPage = 1; // 当前页码

// --- 获取页面元素 ---

const addContactForm = document.getElementById('add-contact-form');
const nameInput = document.getElementById('name-input');
const phoneInput = document.getElementById('phone-input');
const editModal = document.getElementById('edit-modal');
const editContactForm = document.getElementById('edit-contact-form');
const editIdInput = document.getElementById('edit-id-input');
const editNameInput = document.getElementById('edit-name-input');
const editPhoneInput = document.getElementById('edit-phone-input');
const searchInput = document.getElementById('search-input');
const contactsListDiv = document.getElementById('contacts-list');
const pageInfo = document.getElementById('page-info');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');




// 1. 主函数：从后端获取最新数据并存入缓存，然后触发一次完整的渲染
async function fetchDataAndRender() {
  try {
    const response = await fetch(`${API_BASE_URL}/contacts`);
    allContacts = await response.json();
    currentPage = 1; // 每次获取新数据都重置到第一页
    renderPage(); // 调用渲染函数
  } catch (error) {
    console.error('获取联系人失败:', error);
    contactsListDiv.innerHTML = '<p>加载数据失败，请检查网络连接。</p>';
  }
}

// 2. 渲染函数：根据当前状态（搜索词、页码）处理数据并显示
function renderPage() {
  // 步骤 A: 根据搜索框内容过滤联系人
  const searchTerm = searchInput.value.toLowerCase();
  const filteredContacts = allContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm) ||
    contact.phone.includes(searchTerm)
  );

  // 步骤 B: 对过滤后的结果进行排序
  // 使用 pinyin-pro 库，让中文可以按拼音首字母排序
  filteredContacts.sort((a, b) => {
    return pinyinPro.pinyin(a.name, { toneType: 'none' }).localeCompare(pinyinPro.pinyin(b.name, { toneType: 'none' }));
  });

  // 步骤 C: 对排序后的结果进行分页
  const startIndex = (currentPage - 1) * CONTACTS_PER_PAGE;
  const endIndex = startIndex + CONTACTS_PER_PAGE;
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

  // 步骤 D: 将最终要显示的联系人进行分组
  const groupedContacts = groupContacts(paginatedContacts);

  // 步骤 E: 将分组后的数据渲染到 HTML 页面上
  renderGroupedContacts(groupedContacts);

  // 步骤 F: 更新分页按钮和页码信息的状态
  updatePaginationControls(filteredContacts.length);
}


// =================================================================
// --- 辅助函数 ---
// =================================================================

// 辅助函数：将联系人按首字母分组
function groupContacts(contacts) {
  if (contacts.length === 0) return {};

  const groups = {};
  contacts.forEach(contact => {
    // 获取姓名拼音的第一个字母
    let firstLetter = pinyinPro.pinyin(contact.name, { pattern: 'first', toneType: 'none' }).toUpperCase();
    // 如果不是 A-Z 字母，则归入 '#' 组
    if (!/^[A-Z]$/.test(firstLetter)) {
      firstLetter = '#';
    }
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(contact);
  });
  return groups;
}

// 辅助函数：将分组数据渲染成 HTML
function renderGroupedContacts(groupedContacts) {
  contactsListDiv.innerHTML = ''; // 清空现有列表

  // 对分组的键（A, B, C...）进行排序，确保 '#' 组在最后
  const groupKeys = Object.keys(groupedContacts).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });

  if (groupKeys.length === 0) {
    contactsListDiv.innerHTML = '<p>没有找到符合条件的联系人。</p>';
    return;
  }

  groupKeys.forEach(key => {
    const groupArticle = document.createElement('article');
    groupArticle.innerHTML = `<h3 style="background-color: var(--card-background-color); padding: 0.5rem; margin-top: 1rem; border-bottom: 1px solid var(--muted-border-color);">${key}</h3>`;

    groupedContacts[key].forEach(contact => {
      const contactDiv = document.createElement('div');
      contactDiv.className = 'grid';
      contactDiv.style.padding = '0.5rem 1rem';
      contactDiv.innerHTML = `
                <div><strong>${contact.name}</strong><br><small>${contact.phone}</small></div>
                <div style="text-align: right;">
                    <button class="outline edit-btn" data-id="${contact.id}">修改</button>
                    <button class="secondary delete-btn" data-id="${contact.id}">删除</button>
                </div>
            `;
      groupArticle.appendChild(contactDiv);
    });
    contactsListDiv.appendChild(groupArticle);
  });
}

// 辅助函数：更新分页控件
function updatePaginationControls(totalItems) {
  const totalPages = Math.ceil(totalItems / CONTACTS_PER_PAGE) || 1;
  pageInfo.textContent = `第 ${currentPage} / ${totalPages} 页`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage >= totalPages;
}


// =================================================================
// --- 事件监听器 ---
// =================================================================

// 页面首次加载时，获取数据并渲染
document.addEventListener('DOMContentLoaded', fetchDataAndRender);

// 搜索框输入时，实时重新渲染
searchInput.addEventListener('input', () => {
  currentPage = 1; // 每次搜索都回到第一页
  renderPage();
});

// 上一页按钮
prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
});

// 下一页按钮
nextPageBtn.addEventListener('click', () => {
  // 重新计算总页数以防万一
  const totalItems = allContacts.filter(c => c.name.toLowerCase().includes(searchInput.value.toLowerCase()) || c.phone.includes(searchInput.value)).length;
  const totalPages = Math.ceil(totalItems / CONTACTS_PER_PAGE) || 1;
  if (currentPage < totalPages) {
    currentPage++;
    renderPage();
  }
});

// 使用“事件委托”来处理所有修改和删除按钮的点击，性能更高
contactsListDiv.addEventListener('click', (event) => {
  const target = event.target;
  const contactId = target.dataset.id;
  if (!contactId) return; // 如果点击的不是带 data-id 的元素，则忽略

  if (target.classList.contains('edit-btn')) {
    const contact = allContacts.find(c => c.id === Number(contactId));
    if (contact) showEditForm(contact);
  }

  if (target.classList.contains('delete-btn')) {
    deleteContact(contactId);
  }
});

// 添加表单提交
addContactForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = nameInput.value;
  const phone = phoneInput.value;
  fetch(`${API_BASE_URL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone })
  }).then(response => {
    if (response.ok) {
      nameInput.value = '';
      phoneInput.value = '';
      fetchDataAndRender(); // 操作成功后，重新从后端获取最新数据
    } else {
      alert('添加失败，请检查输入。');
    }
  });
});

// 修改表单提交
editContactForm.addEventListener('submit', event => {
  event.preventDefault();
  const id = editIdInput.value;
  const updatedContact = { name: editNameInput.value, phone: editPhoneInput.value };
  fetch(`${API_BASE_URL}/contacts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedContact)
  }).then(response => {
    if (response.ok) {
      hideEditForm();
      fetchDataAndRender(); // 操作成功后，重新从后端获取最新数据
    } else {
      alert('修改失败，请稍后再试。');
    }
  });
});


// =================================================================
// --- 你原来的函数，稍作修改 ---
// =================================================================

function deleteContact(id) {
  if (!confirm('您确定要删除这位联系人吗？')) return;
  fetch(`${API_BASE_URL}/contacts/${id}`, { method: 'DELETE' })
    .then(response => {
      if (response.ok) {
        fetchDataAndRender(); // 操作成功后，重新从后端获取最新数据
      } else {
        alert('删除失败，请稍后再试。');
      }
    });
}

function showEditForm(contact) {
  editIdInput.value = contact.id;
  editNameInput.value = contact.name;
  editPhoneInput.value = contact.phone;
  editModal.showModal();
}

function hideEditForm() {
  editModal.close();
}

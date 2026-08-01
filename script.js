// URL ของ Google Sheet CSV
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTeNWYKUa_cFQCVgakZ3RnqcZnXLopWxwoIq_W5GR-9_2oWoEwB3RRdaYjtYnuFcBhFTZbDSBs8mjRN/pub?output=csv';

document.addEventListener('DOMContentLoaded', () => {
    // 1. ดึงข้อมูลสินค้าจาก Google Sheet
    fetchProducts();

    // 2. Smooth Scrolling for Navigation Links
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. Sticky Navbar Effect on Scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 4. Search Functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keyup', (e) => {
        const searchString = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            const title = card.querySelector('.product-title').textContent.toLowerCase();
            const desc = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchString) || desc.includes(searchString)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// ฟังก์ชันดึงข้อมูลและสร้างการ์ด
async function fetchProducts() {
    try {
        const response = await fetch(CSV_URL);
        const csvText = await response.text();
        parseCSV(csvText);
    } catch (error) {
        console.error('Error fetching CSV:', error);
        document.getElementById('productGrid').innerHTML = '<p style="text-align:center; color:red; grid-column: 1/-1;">ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้ กรุณาลองรีเฟรชหน้าเว็บใหม่ครับ</p>';
    }
}

// ฟังก์ชันแปลง CSV เป็น Data
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const products = [];
    const grid = document.getElementById('productGrid');
    
    // เคลียร์ Loader ทิ้ง
    grid.innerHTML = '';

    // เริ่มวนลูปจากบรรทัดที่ 1 (ข้ามหัวตาราง)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // แยกข้อความด้วยเครื่องหมายคอมม่า (รองรับคอมม่าที่อยู่ในเครื่องหมายคำพูด)
        const row = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
        
        if (row.length >= 6) {
            const product = {
                sku: row[0],
                name: row[1],
                category: row[3],
                description: row[2],
                price: row[4],
                image: row[5]
            };
            
            // สร้างการ์ด HTML ทันที
            createProductCard(product, grid);
        }
    }
}

// ฟังก์ชันสร้างหน้าตาการ์ดสินค้า
function createProductCard(product, container) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-category', product.category);
    
    // โค้ด HTML ด้านในของการ์ดแต่ละใบ
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="card-img" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
        <div class="card-content">
            <h3 class="product-title">${product.name}</h3>
            <p>${product.description}</p>
            <button class="buy-btn" onclick="scrollToOrder('${product.name}')">สั่งซื้อ ${product.price} THB</button>
        </div>
    `;
    
    container.appendChild(card);
}

// 5. Filter Category Functionality (อัปเดตใหม่ให้ตรงกับ HTML)
function filterCategory(category, clickedButton) {
    const cards = document.querySelectorAll('.card');
    const buttons = document.querySelectorAll('.filter-btn');
    
    // อัปเดตสีปุ่ม: ล้างสถานะ active ออกจากทุกปุ่ม แล้วใส่ให้ปุ่มที่เพิ่งโดนกด
    buttons.forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');

    // กรองการ์ดสินค้า
    cards.forEach(card => {
        // เช็คคำว่า 'ทั้งหมด' ให้ตรงกับที่ส่งมาจาก HTML
        if (category === 'ทั้งหมด') { 
            card.style.display = 'flex';
        } else {
            if (card.getAttribute('data-category') === category) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// 6. Scroll to Order Form with Item Name alert (Mockup interaction)
function scrollToOrder(itemName) {
    const orderSection = document.getElementById('order-status');
    
    // Small interaction feedback
    const toast = document.createElement('div');
    toast.textContent = `กำลังไปที่ฟอร์มเพื่อสั่งซื้อ: ${itemName}`;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#845EC2';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    toast.style.zIndex = '1000';
    toast.style.transition = 'opacity 0.5s';
    
    document.body.appendChild(toast);
    
    // Scroll
    window.scrollTo({
        top: orderSection.offsetTop - 70,
        behavior: 'smooth'
    });

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

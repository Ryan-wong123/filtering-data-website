document.addEventListener('DOMContentLoaded', () => {
    fetch('laptop_price.csv')
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                dynamicTyping: true,
                complete: (results) => {
                    const laptops = results.data;
                    const validatedLaptops = validateData(laptops);
                    initializeWebsite(validatedLaptops);
                }
            });
        });

    const filterForm = document.getElementById('filter-form');
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        applyFilters();
    });
});

const validateData = (data) => {
    // Remove empty rows at the end of the CSV
    return data.filter(row => Object.values(row).every(value => value !== null && value !== ""));
    
};

const initializeWebsite = (laptops) => {
    if (laptops.length > 0) {
        window.laptops = laptops;
        displayLaptops(laptops);
        document.getElementById('total-brands').textContent = getTotalBrands(laptops);
    } else {
        alert('No valid data found in the CSV file.');
    }
};

// Higher-Order Function for Filtering
const filterLaptops = (laptops, criteria) => {
    return laptops.filter(laptop => {
        return Object.keys(criteria).every(key => laptop[key] === criteria[key]);
    });
};

// Pure Function for Calculating Total Brands
const getTotalBrands = (laptops) => {
    const brands = laptops.map(laptop => laptop.Company);
    return new Set(brands).size;
};

// Display Laptops
const displayLaptops = (laptops) => {
    const laptopContainer = document.getElementById('laptops');
    laptopContainer.innerHTML = '';
    laptops.forEach(laptop => {
        const laptopElement = document.createElement('div');
        laptopElement.className = 'laptop';
        laptopElement.innerHTML = `
            <h3>${laptop['Product'] || 'Unknown'}</h3>
            <p>Company: ${laptop['Company'] || 'Unknown'}</p>
            <p>Price: $${laptop['Price_euros'] || 'Unknown'}</p>
            <p>Laptop Type: ${laptop['TypeName'] || 'Unknown'}</p>
            <p>Screen Size: ${laptop['Inches'] || 'Unknown'}</p>
            <p>Screen Resolution: ${laptop['ScreenResolution'] || 'Unknown'}</p>
            <p>CPU: ${laptop['Cpu'] || 'Unknown'}</p>
            <p>RAM: ${laptop['Ram'] || 'Unknown'}</p>
            <p>Memory: ${laptop['Memory'] || 'Unknown'}</p>
            <p>GPU: ${laptop['Gpu'] || 'Unknown'}</p>
            <p>Operating System: ${laptop['OpSys'] || 'Unknown'}</p>
            <p>Weight: ${laptop['Weight'] || 'Unknown'}</p>
        `;
        laptopContainer.appendChild(laptopElement);
    });
};


const applyFilters = () => {
    const manufacturer = document.getElementById('manufacturer').value;
    const priceRange = document.getElementById('price').value;
    const criteria = {};

    if (manufacturer) {
        criteria['Company'] = manufacturer;
    }

    if (priceRange) {
        const [minPrice, maxPrice] = priceRange.split('-').map(Number);
        criteria['Price_euros'] = laptop => {
            const price = parseFloat(laptop['Price_euros']);
            return price >= minPrice && price <= maxPrice;
        };
    }

    const filteredLaptops = filterLaptops(window.laptops, criteria);
    displayLaptops(filteredLaptops);
};

// Logic Programming Rules
const rules = [
    { condition: (laptop) => laptop.Price_euros < 500, result: 'budget' },
    { condition: (laptop) => laptop.Price_euros >= 500 && laptop.Price_euros < 1000, result: 'mid-range' },
    { condition: (laptop) => laptop.Price_euros >= 1000, result: 'high-end' },
];

const categorizeLaptops = (laptops, rules) => {
    return laptops.map(laptop => {
        const category = rules.find(rule => rule.condition(laptop)).result;
        return { ...laptop, category };
    });
};

// Example usage of categorizing laptops
// You should call this within initializeWebsite if you want to use categorizedLaptops
const categorizedLaptops = categorizeLaptops(laptops, rules);
console.log(categorizedLaptops);

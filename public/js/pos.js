
// Highlights active row in the order details table and updates the item details with data from the new active row.
const orderDetails = document.querySelector('#orderDetails')

const markActiveRow = (function () {
    let lastActive = null

    return function (event) {
        const target = event.target

        if (target.tagName === "TD") {
            if (lastActive) {
                lastActive.classList.remove('table-active')
            }
            if (document.querySelector('.table-active') != null) {
            document.querySelector('.table-active').classList.remove('table-active')
            }

                target.parentElement.classList.add('table-active')
                updateItemDetails(...target.parentElement.innerText.split('\n'), target.parentElement.classList[0], target.parentElement.id)
                updateItemActions()
                lastActive = document.querySelector('.table-active')
        } else {
            // Empty item details on not clicking a table row.
            if (document.querySelector('.table-active') != null) {
            document.querySelector('.table-active').classList.remove('table-active')
            }

            updateItemDetails()
            updateItemActions()
        }
    }
})()

orderDetails.addEventListener("click", markActiveRow)

// Function to update item details when a new active row is selected on the order details table or when a new item is added to the current order from the database.

function updateItemDetails(name = '', price = '', tax = '', quantity = '', total = '', code = '', id = '') {
    document.querySelector('#itemName').innerText = name
    document.querySelector('#itemTax').innerText = tax
    document.querySelector('#itemPrice').innerText = price
    document.querySelector('#itemQuantity').innerText = quantity
    document.querySelector('#itemTotal').innerText = total
    document.querySelector('#itemCode').innerText = code
    document.querySelector('h2').id = id
}

// Updates the path for all the item action routes when a new item is selected.
function updateItemActions() {
    const orderId = document.querySelector('h1').id || 'x'
    const itemId = document.querySelector('h2').id || 'x'
    document.querySelector('#voidItem').action = 
`/pos/voidItem/${orderId}/${itemId}/?_method=PUT`
    document.querySelector('#voidLine').action = `/pos/voidLine/${orderId}/${itemId}/?_method=PUT`
    document.querySelector('#priceOverride').action = `/pos/priceOverride/${orderId}/${itemId}/?_method=PUT`
}


// Autocomplete
autocomplete({
  container: '#autocomplete',
  placeholder: 'Search...',
  autoFocus: true,
  inputWrapper: 'form-control removeBorder',
  classNames: { 
      inputWrapper: 'form-control squareRight',
      detachedSearchButtonIcon: 'hidden',
      clearButton: 'hidden',
      form: 'removeBorder',
      submitButton: 'hidden',
      detachedSearchButton: 'fixedHeight squareRight correctBorder',
      detachedSearchButtonPlaceholder: 'fixedWidth squareRight',
  },
  onStateChange({ state }) {
    if (state.query !== '') {
      document.querySelector('#searchInput').value = state.query
      const mobileText = document.querySelector('.aa-DetachedSearchButtonPlaceholder')
      if (mobileText != null) {
          mobileText.innerText = state.query
          mobileText.style.color = 'black'
      }
    }
  },
  getSources() {
    return [{
        sourceId: 'items',
        async getItems({ query }) {
            let items = await fetch('/items') 
            items = await items.json()
            
            return items.filter(({ name }) => 
                name.toLowerCase().includes(query.toLowerCase())
                    );
        },
        getItemInputValue({ item }) {
            return item.name
        },
templates: {
          item({ item }) {
            return item.name;
          },
},
    }]
  },
});


// Highlights active row in the order details table and updates the item details with data from the new active row.
const orderDetails = document.querySelector('#orderDetails')

const markActiveRow = (function () {
    let lastActive = null

    return function (event) {
        const target = event.target

        if (target.tagName === "TD") {
            
            const currency = document.querySelectorAll('.currency')
            currency.forEach(e => e.innerText = '')
            
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
            const currency = document.querySelectorAll('.currency')
            currency.forEach(e => e.innerText = '')
            }

            updateItemDetails()
            updateItemActions()
        }
    }
})()

orderDetails.addEventListener("click", markActiveRow)

// Function to update item details when a new active row is selected on the order details table or when a new item is added to the current order from the database.

function updateItemDetails(name = '', price = '', tax = '', total = '', code = '', id = '') {
    console.log(name, price, tax, total, code, id)
    document.querySelector('#itemName').innerText = name
    document.querySelector('#itemTax').innerText = tax
    document.querySelector('#itemPrice').innerText = price
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
            let items = await fetch('/items/getItems') 
            const category = document.querySelector('#searchCategory').value
            items = await items.json()
            
            if (category === 'name') {
            return items.filter(({ name }) => 
                name.toLowerCase().includes(query.toLowerCase())
                    );
            } else if (category === 'code') {
            return items.filter(({ code }) => 
                code.toLowerCase().includes(query.toLowerCase())
                    );
            }
        },
        getItemInputValue({ item }) {
            const category = document.querySelector('#searchCategory').value
            if (category === 'name') {
            return item.name
            } else if (category === 'code') {
            return item.code
            }
        },
templates: {
          item({ item }) {
            const category = document.querySelector('#searchCategory').value
            if (category === 'name') {
            return `Name: ${item.name} - Code: ${item.code}`;
            } else if (category === 'code') {
            return `Code: ${item.code} - Name: ${item.name}`;
            }
          },
},
    }]
  },
});

/*
// Payment option handling

// Cash
const cashButton = document.querySelector("#cashButton")

const orderTotal = document.querySelector("#orderTotal")

const grandTotal = document.querySelector("#grandTotal")
const cashReceived = document.querySelector("#cashReceived")
const changeDue = document.querySelector("#change")

cashButton.addEventListener('click', getCashOrderTotal)

function getCashOrderTotal() {
    if (grandTotal.innerText == null) {
        grandTotal.innerText = orderTotal.innerText
    }
    calculateChange()
}

cashReceived.addEventListener('change', calculateChange)

function calculateChange() {
    // Add handling for decimals over 2 places
    if (cashReceived.value != null) {
    }

    const orderTotalVal = Big(orderTotal.innerText)
    const cashVal = Big(cashReceived.value.toString() || '0.00')

    console.log(orderTotalVal.toString(),cashVal.toString())
    console.log(cashVal.minus(orderTotalVal).toString())

    if (Number(orderTotalVal) <= Number(cashVal)) {
        grandTotal.innerText = '0.00'
        changeDue.innerText = cashVal.minus(orderTotalVal).toString()

    } else if (Number(orderTotalVal) > Number(cashVal)) {
        changeDue.innerText = '0.00' 
        grandTotal.innerText = orderTotalVal.minus(cashVal).toString() 
    }

}

// Get QR Code

document.querySelector('#getQrCode').addEventListener('click', getQrCode)

async function getQrCode() {
    const id = document.querySelector('h1').id
    const display = document.querySelector('#qrDisplay')
    const qrButton = document.querySelector('#getQrCode')
    const completeButton = document.querySelector('#cardComplete')
    const textDisplay = document.querySelector('#cardDisplay')
    qrButton.classList.remove('d-block')
    qrButton.classList.add('hidden')
    display.classList.toggle('spinner-border')
    display.classList.toggle('text-primary')

    const qr = await fetch(`/pos/payment/${id}`, { method: 'PUT', })
    const qrText = await qr.text()

    display.classList.toggle('spinner-border')
    display.classList.toggle('text-primary')
    if (qrText === "Cannot generate payment code with no items in order.") {
        display.style.textAlign = 'center'
        display.innerText = qrText
    } else {
    cardDisplay.innerText = 'Please have customer scan QR code to complete payment.'
    display.innerHTML = qrText
    completeButton.classList.toggle('hidden')
    completeButton.classList.add('d-block')
    }
}
*/

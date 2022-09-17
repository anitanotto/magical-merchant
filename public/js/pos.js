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

                target.parentElement.classList.add('table-active')
                updateItemDetails(...target.parentElement.innerText.split('\n'), target.parentElement.id)
                lastActive = document.querySelector('.table-active')
        } else {
            // Empty item details on not clicking a table row.
            lastActive.classList.remove('table-active')
            updateItemDetails()
        }
    }
})()

orderDetails.addEventListener("click", markActiveRow)

// Function to update item details when a new active row is selected on the order details table or when a new item is added to the current order from the database.

function updateItemDetails(name = '', price = '', tax = '', quantity = '', total = '', code = '') {
    document.querySelector('#itemName').innerText = name
    document.querySelector('#itemTax').innerText = tax
    document.querySelector('#itemPrice').innerText = price
    document.querySelector('#itemQuantity').innerText = quantity
    document.querySelector('#itemTotal').innerText = total
    document.querySelector('#itemCode').innerText = code
}


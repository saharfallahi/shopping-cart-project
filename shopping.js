const cartBtn=document.querySelector(".cart-btn");
const backdrop=document.querySelector(".backdrop");
const cartModal=document.querySelector(".cart");
const closeModal=document.querySelector(".cart-item-confirm");
const cartList=document.querySelector(".cart-list");
const productsDOM=document.querySelector(".products");
const cartTotal=document.querySelector(".cart-total");
const cartCount=document.querySelector(".cart-count");
const clearCart=document.querySelector(".clear-cart");
let cart=[];
let buttonsDOM=[];
const sideNav=document.querySelector(".side-nav");
const closeNavBtn=document.querySelector(".close-btn");
const menuIcon=document.querySelector(".menu-icon");

function showModalFunction(){
    backdrop.classList.remove("hidden");
    cartModal.classList.remove("hidden");
}

function closeModalFunction(){
    backdrop.classList.add("hidden");
    cartModal.classList.add("hidden");
}

cartBtn.addEventListener("click",showModalFunction);
backdrop.addEventListener("click",closeModalFunction);
closeModal.addEventListener("click",closeModalFunction);


function openNav() {
    sideNav.classList.add("side-open");
    sideNav.classList.remove("side-close");
}

function closeNav() {
    // document.getElementsByClassName("side-nav").style.width = "0";
    sideNav.classList.add("side-close");
    sideNav.classList.remove("side-open");

}

closeNavBtn.addEventListener("click",closeNav);
menuIcon.addEventListener("click",openNav);

// get products

import { productsData } from "./shopproducts.js";

// display products

class Products{
    getProducts(){
        return productsData;
    }
    
}

class UI{
    displayProducts(products){
        let results="";
        products.forEach((item) => {
            results+=`<div class="product">
            <div class="product-pic">
                <img  src=${item.imageUrl} alt="">
            </div>
            <div class="product-detail">
                <span class="product-price">${item.price}</span>
                <span class="product-name">${item.title}</span>
            </div>
            <button class=" btn add-to-cart" data-id=${item.id}>add to cart</button>
        </div>`
        });
        productsDOM.innerHTML=results;
    }
    getAddToCartBtns(){
        const addToCartBtns=[...document.querySelectorAll(".add-to-cart")];
        buttonsDOM=addToCartBtns;
        
        addToCartBtns.forEach((btn)=>{
            const id=btn.dataset.id;
            const isInCart=cart.find(p=>p.id===parseInt(id));
            if(isInCart){
                btn.innerText="In Cart";
                btn.disabled=true;
            }
            btn.addEventListener("click",(e)=>{
                e.target.innerText="In Cart";
                e.target.disabled=true;
                // get product from products
                const addedProduct={...Storage.getProduct(id),quantity:1};
                // add to cart
                cart=[...cart,addedProduct];
                // save cart to local storage
                Storage.saveCart(cart);
                this.setCartValue(cart);
                this.addCartItem(addedProduct);
            })
        });
    }
    setCartValue(cart){
        let tempCartItems=0;
        const totalPrice=cart.reduce((acc,curr)=>{
            tempCartItems+=curr.quantity
            return acc + curr.quantity * curr.price;
        },0);
        cartTotal.innerText=`Total Price : ${totalPrice.toFixed(2)} $`;
        cartCount.innerText=tempCartItems;
    }
    addCartItem(cartItem){
        const div=document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML=`<img src=${cartItem.imageUrl} alt="" class="cart-item-img">
            <div class="cart-item-desc">
                <span class="cart-item-name">${cartItem.title}</span>
                <span class="cart-item-price">${cartItem.price} $</span>
            </div>
            <div class="cart-item-controller">
                <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
                <p>${cartItem.quantity}</p>
                <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
            </div>
            <span>
                <i class="fa fa-trash-alt" aria-hidden="true" data-id=${cartItem.id}></i>
            </span>`
        cartList.appendChild(div);
    }
    setupApp(){
        //get cart from storage
        cart=Storage.getCart() || [];
        //addCartItem
        cart.forEach((cartItem)=>this.addCartItem(cartItem));
        this.setCartValue(cart);
    }
    cartLogic(){
        clearCart.addEventListener("click",()=>this.clearCart());
        
        cartList.addEventListener("click",(e)=>{
            // console.log(e.target);
            if(e.target.classList.contains("fa-chevron-up")){
                // console.log(e.target.dataset.id);
                const addQuantity=e.target;
                // get item from cart
                const addedItem=cart.find((cItem)=>cItem.id===parseInt(addQuantity.dataset.id));
                addedItem.quantity++;
                // update cart value
                this.setCartValue(cart);
                // save cart
                Storage.saveCart(cart);
                // update cart item in UI
                addQuantity.nextElementSibling.innerText=addedItem.quantity;

            }else if(e.target.classList.contains("fa-chevron-down")){
                // console.log(e.target.dataset.id);
                const subQuantity=e.target;
                // get item from cart
                const subedItem=cart.find((cItem)=>cItem.id===parseInt(subQuantity.dataset.id));
                if(subedItem.quantity===1){
                    this.removeItem(subedItem.id);
                    cartList.removeChild(subQuantity.parentElement.parentElement);
                    this.checkEmptyCart(cart);
                    return;
                }
                subedItem.quantity--;
                // update cart value
                this.setCartValue(cart);
                // save cart
                Storage.saveCart(cart);
                // update cart item in UI
                subQuantity.previousElementSibling.innerText=subedItem.quantity;

            }else if(e.target.classList.contains("fa-trash-alt")){
                // console.log(e.target.dataset.id);
                const removeItem=e.target;
                // get item from cart
                const removedItem=cart.find((cItem)=>cItem.id===parseInt(removeItem.dataset.id));
                this.removeItem(removedItem.id);
                // update cart value
                this.setCartValue(cart);
                // save cart
                Storage.saveCart(cart);
                // update cart item in UI
                cartList.removeChild(removeItem.parentElement.parentElement);
                this.checkEmptyCart(cart);

            }
        })

    }
    clearCart(){
        cart.forEach((cItem)=>this.removeItem(cItem.id));
            //remove cart content children
            while(cartList.children.length){
                cartList.removeChild(cartList.children[0]);
            }
            closeModalFunction();
    }
    removeItem(id){
        //update cart
        cart=cart.filter((cItem)=>cItem.id!==id);
        // total price and cart items
        this.setCartValue(cart);
        //update storage
        Storage.saveCart(cart);

        this.getSingleButton(id);
    }
    getSingleButton(id){
        const button=buttonsDOM.find((btn)=>parseInt(btn.dataset.id)===parseInt(id));
        button.innerText="add to cart";
        button.disabled=false; 
    }
    checkEmptyCart(cart){
        if(cart.length===0) closeModalFunction();
    }

}


class Storage{
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }
    static getProduct(id){
        const _products=JSON.parse(localStorage.getItem("products"));
        return _products.find((p)=>p.id===parseInt(id));
    }
    static saveCart(cart){
        localStorage.setItem("cart",JSON.stringify(cart));
    }
    static getCart(){
        return JSON.parse(localStorage.getItem("cart"));

    }
}

document.addEventListener("DOMContentLoaded",()=>{
    const products=new Products();
    const productsData=products.getProducts();
    // console.log(productsData);
    const ui=new UI();
    ui.displayProducts(productsData);
    ui.setupApp();
    ui.getAddToCartBtns();
    ui.cartLogic();
    Storage.saveProducts(productsData);

   
})


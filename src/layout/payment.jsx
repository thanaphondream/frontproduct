import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Payment = () => {
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ product, setProducts ] = useState([])
  const navigate = useNavigate();

  useEffect(() => {
    const showCart = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/cart/showidcart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCart(response.data);
        response.data.map(r => {
          console.log(r.total)
        })
        // console.log("dfaffff",item.id)
        // cart.map(item => {
        //   console.log("ss", item.product.store)
        // })
      } catch (err) {
        console.error('Error fetching cart data', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    showCart();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://localhost:8000/cart/user', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
          setUserId(response.data.id);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, []);

  const calculateTotalPrice = () => {
    return cart.reduce((total, cartItem) => total + cartItem.all_price, 0);
  };

  const handleCheckout = async () => {
    try {
      const cartclones = cart.map(item => item.id);
      console.log("dwee", cartclones);
  
      // สร้าง Cartclone Items และรอให้เสร็จสิ้น
      const cartcloneResponses = await Promise.all(
        cartclones.map(c => axios.post('http://localhost:8000/cart/cartclone/', { id: c }))
      );
  
      // สร้าง Order สำหรับทุก Cartclone
      console.log("dadd",cartcloneResponses)
      // const orderPromises = cartcloneResponses.map(response => {
      //   const cartcloneId = response.data.cartclone.id
      //   console.log("1221",cartcloneId)
      // console.log("ddssf", cartcloneResponses)
      // cartcloneResponses.map(i => {
      //   console.log("dafffssaafff", )
      // })
       const rs1 = await axios.post('http://localhost:8000/orders/create', {
          cartcloneId: cartcloneResponses.map(i => i.data.cartclone.id),
          date: new Date(),
          userId: user.id,
          status: 'ชำระแล้ว'
        });
        console.log("aadff",rs1.data.id)
      // });
  
      // const orderResponses = await Promise.all(orderPromises);
  
      // อัพเดตสถานะของ Cart และสร้าง Payment สำหรับทุก Order
      const updateStatusPromises = cart.map(item => updatestatus(item.id));
      cart.map(item =>  uproductstore(item));
      // await Promise.all(updateStatusPromises);


      const paymentData = {
        date: new Date(),
        userId: user.id,
        status: 'กำลังจัดส่ง',
        all_price: calculateTotalPrice(),
        orderId: rs1.data.id
      };
      console.log(paymentData);
  
      const payments = await axios.post('http://localhost:8000/payment/payments', paymentData);
      console.log(payments.data);
  
      // จัดการสถานะสำเร็จ
      setSuccess(true);
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Your work has been saved",
        showConfirmButton: false,
        timer: 1500
      });
      navigate('/');
  
    } catch (error) {
      console.error('Error creating order or payment:', error.response ? error.response.data : error.message);
      setError('Error creating order or payment. Please try again.');
    }
  };

  const updatestatus = async (id) => {
    try {
      console.log(`Updating status for cart item ID: ${id}`);
      const response = await axios.delete(`http://localhost:8000/cart/deletecart/${id}`);
      console.log(`Update status response for cart item ID ${id}:`, response.data);
    } catch (err) {
      console.error("UpdateStatus Error:", err.response ? err.response.data : err.message);
    }
  };

  const uproductstore = async (products) => {
    try{
      console.log("ddfaff111",products.id)
      // const token = localStorage.getItem('token');
      // const rspro = await axios.get(`http://localhost:8000/product/productId/${products.product.id}`,{
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      // setProducts(rspro.data)

      // console.log(rspro)
      const store = products.product.store - products.total
      console.log("affssff",products.total)
      const rs = await axios.put(`http://localhost:8000/product/productstore/${products.product.id}`, {
        store: store
      })
      console.log(rs.data)

    }catch(err){
      console.error('เกิดข้อผิดพลาด',err)
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center">หน้าชำระเงิน</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">ลำดับ</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">รูปภาพ</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">สินค้า</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">ประเภท</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">ราคา</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((cartItem, index) => (
              <tr key={cartItem.id} className="hover:bg-gray-100">
                <td className="px-6 py-4 border-b border-gray-300">{index + 1}</td>
                <td className="px-6 py-4 border-b border-gray-300">
                  <img
                    src={cartItem.product.image}
                    alt={cartItem.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 border-b border-gray-300">{cartItem.product.name}</td>
                <td className="px-6 py-4 border-b border-gray-300">{cartItem.product.category}</td>
                <td className="px-6 py-4 border-b border-gray-300">{cartItem.all_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h1 className="text-2xl font-bold mt-6">ราคารวม: {calculateTotalPrice()} บาท</h1>
      <div className="mt-6">
        <button
          type="button"
          className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center"
          onClick={handleCheckout}
        >
          ชำระเงิน
        </button>
      </div>
      {error && <div className="text-red-500 mt-4">{error}</div>}
      {success && <div className="text-green-500 mt-4">คำสั่งซื้อและการชำระเงินสำเร็จ!</div>}
    </div>
  );
};

export default Payment;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2'

// const Payment = () => {
//   const [cart, setCart] = useState([]);
//   const [date, setDate] = useState('');
//   const [userId, setUserId] = useState('');
//   const [status, setStatus] = useState('pending');
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [payment, setPayment] = useState({});
//   const navigate = useNavigate();

//   useEffect(() => {
//     const showCart = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get('http://localhost:8000/cart/showcarts', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setCart(response.data);
//       } catch (err) {
//         console.error('Error fetching cart data', err);
//         setError(err.message || 'Unknown error');
//       } finally {
//         setLoading(false);
//       }
//     };
//     showCart();
//   }, []);

//   useEffect(() => {
//     const getUser = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           const response = await axios.get('http://localhost:8000/cart/user', {
//             headers: { Authorization: `Bearer ${token}` }
//           });
//           setUser(response.data);
//           setUserId(response.data.id); // Ensure userId is set correctly
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     getUser();
//   }, []);

//   const calculateTotalPrice = () => {
//     return cart.reduce((total, cartItem) => total + cartItem.all_price, 0);
//   };

//   const handleCheckout = async () => {
//     try {
//       const orderResponse = await axios.post('http://localhost:8000/cart/orders/create', {
//         cartIds: cart.map(item => item.id),
//         date: new Date(),
//         userId: user.id,
//         status
//       });

//       console.log('Order created:', orderResponse.data);

      

//       const paymentResponse = await axios.post('http://localhost:8000/payment/payments', {
//         date: new Date(),
//         userId: user.id,
//         status: 'กำลังจัดส่ง',
//         all_price: calculateTotalPrice(),
//         orderId: orderResponse.data.id
//       });

//       console.log('Payment created:', paymentResponse.data);
//       setSuccess(true);
//         Swal.fire({
//         position: "center",
//         icon: "success",
//         title: "Your work has been saved",
//         showConfirmButton: false,
//         timer: 1500
//       });
//       navigate('/')
//     } catch (error) {
//       console.error('Error creating order or payment:', error);
//       setError('Error creating order or payment. Please try again.');
//     }
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="container mx-auto mt-10">
//       <h2 className="text-3xl font-bold mb-6 text-center">หน้าชำระเงิน</h2>
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white border border-gray-300">
//           <thead>
//             <tr>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">ลำดับ</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">รูปภาพ</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">สินค้า</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">ประเภท</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">ราคา</th>
//             </tr>
//           </thead>
//           <tbody>
//             {cart.map((cartItem, index) => (
//               <tr key={cartItem.id} className="hover:bg-gray-100">
//                 <td className="px-6 py-4 border-b border-gray-300">{index + 1}</td>
//                 <td className="px-6 py-4 border-b border-gray-300">
//                   <img
//                     src={cartItem.product.image}
//                     alt={cartItem.product.name}
//                     className="w-16 h-16 object-cover rounded"
//                   />
//                 </td>
//                 <td className="px-6 py-4 border-b border-gray-300">{cartItem.product.name}</td>
//                 <td className="px-6 py-4 border-b border-gray-300">{cartItem.product.category}</td>
//                 <td className="px-6 py-4 border-b border-gray-300">{cartItem.all_price}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <h1 className="text-2xl font-bold mt-6">ราคารวม: {calculateTotalPrice()} บาท</h1>
//       <div className="mt-6">
//         <button
//           type="button"
//           className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center"
//           onClick={handleCheckout}
//         >
//           ชำระเงิน
//         </button>
//       </div>
//       {error && <div className="text-red-500 mt-4">{error}</div>}
//       {success && <div className="text-green-500 mt-4">คำสั่งซื้อและการชำระเงินสำเร็จ!</div>}
//     </div>
//   );
// };

// export default Payment;

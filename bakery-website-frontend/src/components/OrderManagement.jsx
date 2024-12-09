import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTable, useSortBy, useFilters, useGlobalFilter } from 'react-table'; 


const OrderManagement = () => {
  const { getAuthHeader, userRole } = useAuth();
  const [orders, setOrders] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [productSummary, setProductSummary] = useState([]); // To store aggregated product summary
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchStaff();
  }, []);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/orders', getAuthHeader());
      setOrders(response.data);
      calculateProductSummary(response.data); // Calculate product summary after fetching orders
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Fetch staff members to display assigned staff names
  const fetchStaff = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/staff', getAuthHeader());
      setStaffList(response.data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  // Calculate product summary
  const calculateProductSummary = (orders) => {
    const summary = {};
    orders.forEach((order) => {
      if (order.assignedStaff?.id === getAuthHeader()?.userId) { // Filter orders assigned to the logged-in staff
        // Exclude completed orders from the summary
        if (order.status === 'completed') {
          return;
        }
        order.products.forEach(({ product, quantity }) => {
          if (summary[product.name]) {
            summary[product.name] += quantity;
          } else {
            summary[product.name] = quantity;
          }
        });
      }
    });

    // Convert summary object to an array for easier rendering
    const summaryArray = Object.entries(summary).map(([name, quantity]) => ({ name, quantity }));
    setProductSummary(summaryArray);
  };

  // Navigate to Order Details page
  const handleViewOrder = (orderId) => {
    navigate(`/orders/details/${orderId}`);
  };

  // Navigate to Edit Order page
  const handleEditOrder = (orderId) => {
    navigate(`/orders/edit/${orderId}`);
  };

  // Delete order
  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:5001/api/orders/${orderId}`, getAuthHeader());
      fetchOrders(); // Refresh orders after deletion
    } catch (err) {
      alert(err.response.data.message);
      console.error('Error deleting order:', err);
    }
  };

  // Filter by input
  const ColumnFilter = ({ column: { filterValue, setFilter, id, getSortByToggleProps } }) => {
    const stopPropagation = (e) => {
      e.stopPropagation();
    };
  
    return (
      // warp this in another div to stop 'sorting' with click to filter
      <div {...getSortByToggleProps()} onClick={stopPropagation}>
        <input
          value={filterValue || ''}
          onChange={e => setFilter(e.target.value || undefined)} // Update the filter value
          placeholder={`Search ${id}`}
          style={{ width: '100%' }}
        />
      </div>
    );
  };

  // Filter by existing option
  const ColumnDropdownFilter = ({ column: { filterValue, setFilter, preFilteredRows, id, getSortByToggleProps } }) => {
    const options = React.useMemo(() => {
      // Go thru the row to get all options and converte them to unique 'id'
      const values = new Set();
      preFilteredRows.forEach(row => {
        values.add(row.values[id]);
      });
      return [...values];
    }, [id, preFilteredRows]);

    const handleDropdownChange = (e) => {
      setFilter(e.target.value || undefined);
    };

    // Because no one like junky sorting (prevent sort when click on filter)
    const stopPropagation = (e) => {
      e.stopPropagation();
    };

    // actual part to filter, see similarity to ColumnFilter
    return (
      <div {...getSortByToggleProps()} onClick={stopPropagation}>
        <select
          value={filterValue || ''}
          onChange={handleDropdownChange}
          style={{ width: '100%' }}>
          <option value="">All</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const staffColumns = React.useMemo(
    () => [
      { Header: 'Customer',
        accessor: 'customer.name',
        Filter: ColumnFilter,},
      { Header: 'Status',
        accessor: 'status',
        Filter: ColumnDropdownFilter,},
      {  Header: 'Priority',
        accessor: 'priority',
        Filter: ColumnDropdownFilter,},
      { Header: 'Products',
        accessor: 'products',
        Filter: () => null,
        Cell: ({ row }) => row.original.products.map(product => `${product.product.name} (x${product.quantity})`).join(', '),},
      { Header: 'Assigned Staff',
        accessor: 'assignedStaff.name',
        Filter: ColumnDropdownFilter,},
      { Header: 'Total Price',
        accessor: 'totalPrice',
        Filter: () => null,
        Cell: ({ value }) => value.toFixed(2),},
      { Header: 'Actions',
        Filter: () => null,
        Cell: ({ row }) => (
          <>
            <Button variant="info" onClick={() => handleViewOrder(row.original._id)} className="me-2">View</Button>
            <Button variant="warning" onClick={() => handleEditOrder(row.original._id)}>Edit</Button>
            <Button variant="danger" onClick={() => handleDeleteOrder(row.original._id)}>Cancel Order</Button>
          </>
        ),},
    ],
    []
  );
  
  const customerColumns = React.useMemo(
    () => [
      { Header: 'Status',
        accessor: 'status',
        Filter: ColumnDropdownFilter,},
      { Header: 'Products',
        accessor: 'products',
        Filter: () => null,
        Cell: ({ row }) => row.original.products.map(product => `${product.product.name} (x${product.quantity})`).join(', '),},
      { Header: 'Assigned Staff',
        accessor: 'assignedStaff.name',
        Filter: ColumnDropdownFilter,},
      { Header: 'Total Price',
        accessor: 'totalPrice',
        Filter: () => null,
        Cell: ({ value }) => value.toFixed(2),},
      { Header: 'Actions',
        Filter: () => null,
        Cell: ({ row }) => (
          <>
            <Button variant="info" onClick={() => handleViewOrder(row.original._id)} className="me-2">View</Button>
            <Button variant="warning" onClick={() => handleEditOrder(row.original._id)}>Edit</Button>
            <Button variant="danger" onClick={() => handleDeleteOrder(row.original._id)}>Cancel Order</Button>
          </>
        ),},
    ],
    []
  );

  const columns = userRole !== 'customer' ? staffColumns : customerColumns;

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, setFilter, state: { sortBy } } = useTable(
    { columns, data: orders },
    useFilters,
    useSortBy
  );


  return (
    <div>
      <h3>Manage Orders</h3>

      {/* Product Summary Section */}
      <div className="mt-4">
        <h4>Pending Product Summary</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {productSummary.map((product) => (
              <tr key={product.name}>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Order Management Table */}
      <h4>Orders List</h4>
      <Table striped bordered hover className="mt-4" {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => {
          const headerGroupProps = headerGroup.getHeaderGroupProps();
          return (
            <tr {...headerGroupProps} key={headerGroupProps.key}>
              {headerGroup.headers.map(column => {
                const { key, ...columnProps } = column.getHeaderProps(column.getSortByToggleProps());
                return (
                  <th key={key} {...columnProps}>
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' ↓'
                          : ' ↑'
                        : ''}
                    </span>
                    <div>{column.render('Filter')}</div>
                  </th>
                );
              })}
            </tr>
          );
        })}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} key={row.id}>
              {row.cells.map(cell => (
                <td {...cell.getCellProps()} key={`${row.id}-${cell.column.id}`}>{cell.render('Cell')}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
      </Table>
    </div>
  );
};

export default OrderManagement;
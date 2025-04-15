# Shop Sales Insight Dashboard

## Project Overview

The Shop Sales Insight Dashboard is a comprehensive web application designed to simplify daily sales tracking for retail businesses. This application allows store managers to easily record, calculate, and visualize essential financial data.

## Features

- **Daily Sales Recording**: Track POS sales, digital payments, and cash transactions
- **Cash Management**: Record opening balances, cash withdrawals, and denomination counts
- **Expense Tracking**: Monitor employee advances, cleaning costs, and other daily expenses
- **Automatic Calculations**: Get instant summaries of total sales, expenses, and cash differences
- **Data Validation**: Prevent common errors with built-in validation rules
- **Visual Indicators**: Color-coded alerts for cash discrepancies
- **Data Export**: Download sales records as CSV files for accounting purposes

## How to Use

1. **Enter Basic Information**:
   - Date of the sales record
   - Opening cash balance
   - Total POS sales
   - Paytm/digital payment sales

2. **Record Expenses**:
   - Employee advances
   - Cleaning expenses
   - Other miscellaneous expenses

3. **Count Cash Denominations**:
   - Enter the count for each denomination (500, 200, 100, 50, 20, 10, 5)
   - View the calculated total amount

4. **Record Cash Withdrawals**:
   - Enter the amount of cash withdrawn

5. **Review Summary**:
   - View calculated totals and balances
   - Check for any cash discrepancies

6. **Save and Export**:
   - Save the daily record
   - Download data as CSV when needed

## Technical Details

This project is built with:
- React & TypeScript for the frontend
- Tailwind CSS for styling
- ShadCN UI for component library
- Local storage for data persistence
- CSV export functionality

## Project Structure

- `/components/dashboard`: Main dashboard components
- `/types`: TypeScript definitions for data structures
- `/services`: Data management and storage services
- `/utils`: Calculation and validation utilities

## Future Enhancements

- Data visualization with charts and graphs
- Historical data analysis
- User authentication
- Cloud data synchronization

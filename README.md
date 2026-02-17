# Project 2 — SauceDemo (Swag Labs) Manual Testing

**Website:** https://www.saucedemo.com  
**Type:** Demo E-Commerce Web Application 
**Test Type:** Manual Black-box Functional Testing  
**Date:** September 2025  
**Tester:** Pragati Kumar Chaudhary 

---

## About This Project

SauceDemo (also called Swag Labs) is a demo shopping website built by Sauce Labs specifically for QA engineers to practise testing. It has a login page, a products page, a shopping cart, and a full checkout flow.

This is my second portfolio project. Compared to Project 1 (OpenCart), I focused on testing a **complete end-to-end flow** — from logging in all the way through to placing an order. I also improved my test case format by adding a **Test Type column** (Positive / Negative) to make the testing more organised.

---

## Test Accounts Available on SauceDemo

SauceDemo provides built-in test accounts. I used these during testing:

| Username | Password | Used For |
|----------|----------|----------|
| standard_user | secret_sauce | Main testing account — all normal flow tests |
| locked_out_user | secret_sauce | Negative test — verifying locked account behaviour |

---

## What Was Tested

| Module | What I Tested | Test Cases |
|--------|--------------|------------|
| Login | Valid login, wrong password, empty fields, locked user, dismiss error | TC_SD_001 – TC_SD_006 |
| Products Page | Product count, sorting by price and name, product detail page | TC_SD_007 – TC_SD_010 |
| Cart | Add to cart, cart badge count, remove from cart, cart page content | TC_SD_011 – TC_SD_015 |
| Checkout | Full flow, missing fields validation, overview page, confirmation page | TC_SD_016 – TC_SD_021 |
| Logout | Logout via menu, accessing protected page after logout | TC_SD_022 – TC_SD_023 |
| **Total** | | **23 test cases** |

**Positive tests (happy path):** 18  
**Negative tests (error/invalid input):** 5

---

## Bugs Found

| Bug ID | Where | What the Bug Is | Severity | Priority |
|--------|-------|-----------------|----------|----------|
| BUG_SD_001 | Checkout | Zip Code field accepts letters and special characters — no format validation | Low | Medium |
| BUG_SD_002 | Products Page | Sort order resets to default when returning from a product detail page | Low | Low |
| BUG_SD_003 | Cart / Checkout | Browser Back button after completed order shows the old Checkout Overview again | Low | Low |

All three bugs are real and can be reproduced by following the steps in the Bug Report sheet.  
The main flows (login, add to cart, full checkout) all work correctly.

---

## Files in This Folder

### `SauceDemo_TestPlan.docx`
The test plan document. Contains:
- Introduction and project background
- About the application (including all available test user accounts)
- Scope and out of scope
- Test environment details
- Test objectives
- Test case summary table (with Positive vs Negative breakdown)
- All 3 bug reports written in full detail
- Entry and exit criteria
- Risks and assumptions

### `SauceDemo_TestCases.xlsx`
The main working file. Has 3 sheets:
- **Test Cases** — 23 test cases with ID, module, test type (Positive/Negative), pre-conditions, steps, test data, expected result, actual result, and status
- **Bug Report** — 3 bugs with severity, priority, steps to reproduce, expected vs actual, and status
- **Test Summary** — summary template to fill in after execution

### `SauceDemo_RTM.csv`
Requirements Traceability Matrix. Maps each of the 23 requirements (REQ_SD_001 to REQ_SD_023) to a test case. Includes the test type and current status column. Can be opened in Excel or Google Sheets.

---

## How to Run These Tests Yourself

1. Open https://www.saucedemo.com in Chrome
2. Open `SauceDemo_TestCases.xlsx` → **Test Cases** sheet
3. Start from TC_SD_001 and follow the steps in order
4. Use the test data from the **Test Data** column (usernames, passwords, names etc.)
5. Write what actually happened in the **Actual Result** column
6. Mark **Status** as Pass, Fail, or Blocked
7. For any Fail — take a screenshot and note it in the **Remarks** column

> **Tip:** SauceDemo does not save cart data between sessions. Always start from a fresh login for each test run.

---

## What I Did Differently Compared to Project 1

| | Project 1 (OpenCart) | Project 2 (SauceDemo) |
|--|---------------------|----------------------|
| Test cases | 20 | 23 |
| Test Type column | No | Yes (Positive / Negative) |
| Flow covered | Individual modules | Full end-to-end journey |
| Checkout testing | Not covered | Full 3-step checkout tested |
| Test Data column | No | Yes |

---

## Key Things I Learned from This Project

- How to test a complete user journey from start to finish, not just isolated features
- The importance of classifying tests as positive or negative before writing them
- That bugs can exist even on simple demo sites — zip code validation was completely missing
- How browser history and page state can cause unexpected behaviour after an order is placed

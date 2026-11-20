# OwlSwipe

> A student-to-student marketplace for buying and selling campus meal swipes.

## Overview

Most meal plans leave students with swipes they never use, while other students run out before the semester ends. OwlSwipe connects the two. Students with extra swipes list them for sale, and students who need a meal buy one for less than paying at the door. Sellers earn back part of what they spent on their plan, and buyers eat for less.

Prices are set by students. The swipe itself happens in person: Seller uses a meal swipe through GrubHub, then the buyer uses the information provided by the seller to pick up the order.

**Status:** In planning / early design. This README describes what we plan to build.

## Who it's for

- **Sellers:** students with more meal swipes than they'll use, who want to turn them into money instead of letting them expire.
- **Buyers:** students who are out of swipes, don't have a meal plan, or want a cheaper meal on campus.

OwlSwipe is for verified students only. Every account is tied to a school email address.

## Main features

| Feature | What it does |
|---|---|
| **School email login** | Students sign in with their school email and confirm it with a one-time code. Non-school addresses are rejected. No passwords. |
| **Marketplace** | Browse swipes for sale, filtered by location, time and price. Sellers create listings saying where, when and for how much. |
| **Buying a swipe** | Pick a listing, pay, and get matched with the seller which will create the order for the buyer. Payment is released once the buyer confirms they got in. |
| **Recent orders** | A history of swipes you've bought, sold and listed, with each one's status (e.g. waiting for buyer, completed). |
| **Balance** | Your earnings from sales, pending payouts and available funds. Cash out or add funds to buy swipes. |

## How it works

1. **List:** A seller posts their extra swipes with a GrubHub store/restaurant, available times and a price.
2. **Buy:** A buyer finds a swipe and pays from their balance or card.
3. **Order & eat:** The seller lists a meal swipe, then the buyer shows up to the store and picks up the order. The money moves to the seller's balance, and the order shows up in both users' recent orders.

## High-Level Requirements

* **Account verification:** Users must verify an approved school email address with a valid one-time code before creating listings or making purchases. The same account can be used to buy and sell swipes.

* **Creating and managing listings:** Sellers must provide the location, available date and time, number of swipes, and price per swipe. Sellers can edit or remove their available listings, but changes must not alter the details of an existing purchase.

* **Browsing the marketplace:** Buyers can view available listings and filter them by location, time, and price. Expired, canceled, and sold-out listings must no longer appear as available to purchase.

* **Reserving a swipe:** A purchase must reserve a swipe and update the listing's available quantity. The system must prevent buyers from purchasing their own listings or purchasing more swipes than a seller has available, including when multiple buyers purchase at the same time.

* **Payment handling:** Buyers can pay using their available balance or a card. A failed payment must not produce a confirmed purchase, and the seller's earnings must remain pending until the buyer confirms entry.


* **Completing an order:** Only the buyer attached to an order can confirm that they entered the store/restaurant listed on GrubHub. Confirmation must mark the order as completed for both users and credit the seller's available balance exactly once.

* **Recent orders:** Users can view their purchases, sales, and listings with their current status. The history must distinguish available listings, pending orders, completed orders, canceled orders, and reported problems.

* **Balance management:** Users can view available funds, pending earnings, and their transaction history. Adding funds must update the balance only after successful payment, and cash-out requests cannot exceed the user's available funds.

* **Cancellations and problems:** Sellers can remove unsold listings, and buyers can report incorrect order details or unsuccessful swipes. Reported orders must remain unresolved without releasing the seller's payment, and any cancellation or refund must update both the order status and affected balances.

## Basic System Requirements

* **Input validation:** Required fields must be checked before submission. Prices must be positive, swipe quantities must be positive whole numbers, and listing availability must include a valid future time.

* **Account access:** Users can manage only their own listings, orders, and balance. Private order and payment information must be restricted to the appropriate account holders.

* **Saved information:** Listings, orders, and balances must remain saved after users refresh the page, sign out, or return later.

* **Usability:** The website must work on phones and computers, with clear navigation between the marketplace, listing form, recent orders, and balance pages.

* **Development payments:** Payments, deposits, and cash-outs must use test mode or simulated transactions during development.

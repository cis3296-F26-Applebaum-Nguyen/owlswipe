<div align="center">

# OwlSwipe

Brief project tagline.

</div>

## Project Abstract

Explain problem, intended users, and proposed solution.

## High-Level Requirements

* **User accounts:** Users must register with an @temple.edu email address and sign in. Each account can be used to buy and sell meals.

* **Meal requests:** Buyers can create requests that include the restaurant, food items, pickup time, and offered price. Requests with missing required information or an invalid price cannot be submitted.

* **Marketplace:** Sellers can browse available requests and accept an order they want to fulfill. Each request can only be accepted by one seller, even if multiple sellers try to accept it at the same time.

* **Order fulfillment:** Sellers place the requested order through Grubhub using their meal swipes. The assigned seller then uploads the order number and a confirmation screenshot to OwlSwipe.

* **Order status:** Buyers and sellers can view the current status of their orders and track progress from acceptance through pickup.

* **Pickup confirmation and payment:** Only the buyer who created the request can confirm pickup. Payments use Stripe test mode, with payment authorized when the request is posted and captured after the buyer confirms receiving the food.

* **Missing orders:** Buyers can report an order they did not receive and request a refund. An unresolved report must prevent the order from automatically completing or releasing payment.

* **Communication:** Buyers and sellers can exchange messages about their order and receive notifications when its status changes.

* **Ratings:** Buyers and sellers can rate each other after completing an order.

* **Mobile access:** The website must be usable on both phones and computers.

## Conceptual Design

Summarize software architecture, platforms, languages, and major integrations.

## Background

Describe related systems, research, and important differences from existing work.

## Required Resources

List required hardware, software, services, data, and specialist knowledge.

## Contributors

List team members and link their GitHub profiles.

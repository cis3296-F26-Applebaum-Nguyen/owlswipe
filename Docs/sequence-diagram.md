sequenceDiagram
    actor S as Seller
    actor B as Buyer
    participant App as OwlSwipe App
    participant Server as Backend

    S->>App: Create listing (hall, time, price)
    App->>Server: Save listing
    Server-->>App: Listing

    B->>App: Browse listings
    App->>Server: Get listings
    Server-->>App: Availa
    B->>App: Select listing and pay
    App->>Server: Create
    Server-->>App: Order confirmed
    App-->>B: Meet seller
    App-->>S: Swipe sold, meet buyer

    S->>B: Swipes buyer in at entrance
    B->>App: Confirm "I g
    App->>Server: Complete order
    Server->>Server: Relence
    App-->>S: Funds added to balance
    App-->>B: Order compl
  
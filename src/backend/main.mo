import AccessControl "authorization/access-control";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import MixinStorage "blob-storage/Mixin";



actor {
  include MixinStorage();

  type Product = {
    name : Text;
    price : Float;
    category : Category;
    imageData : ?Text;
    status : ProductStatus;
  };

  type Category = {
    #normal;
    #kostenlos;
  };

  type ProductStatus = {
    #available;
    #soldOut;
  };

  type Purchase = {
    username : Text;
    productName : Text;
    price : Float;
    confirmed : Bool;
  };

  public type UserProfile = {
    name : Text;
  };

  type Session = {
    principal : Principal;
    username : Text;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.name, product2.name);
    };
  };

  module Purchase {
    public func compare(purchase1 : Purchase, purchase2 : Purchase) : Order.Order {
      switch (Text.compare(purchase1.username, purchase2.username)) {
        case (#equal) { Text.compare(purchase1.productName, purchase2.productName) };
        case (order) { order };
      };
    };
  };

  let products = Map.empty<Text, Product>();
  let pendingPurchases = Map.empty<Nat, Purchase>();
  let confirmedPurchases = Map.empty<Nat, Purchase>();
  var purchaseCounter : Nat = 0;
  var isInitialized : Bool = false;
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();

  let sessions = Map.empty<Principal, Session>();

  let validUsernames = [
    "Aurelio",
    "Ensar",
    "Mohammed",
    "Omar",
    "Yassin",
    "Steven",
  ];

  private func isValidUsername(username : Text) : Bool {
    validUsernames.find(func(u) { u == username }) != null;
  };

  private func getSessionForCaller(caller : Principal) : ?Session {
    sessions.get(caller);
  };

  private func getUsernameForCaller(caller : Principal) : ?Text {
    switch (sessions.get(caller)) {
      case (?session) { ?session.username };
      case (null) { null };
    };
  };

  private func performInitialSetup() : () {
    if (not isInitialized) {
      seedInitialProducts();
      isInitialized := true;
    };
  };

  private func seedInitialProducts() : () {
    let initialProducts : [(Text, Product)] = [
      (
        "Guerriro Digitale",
        {
          name = "Guerriro Digitale";
          price = 0.0;
          category = #kostenlos;
          imageData = null;
          status = #available;
        },
      ),
      (
        "Extinct Tralalero",
        {
          name = "Extinct Tralalero";
          price = 0.38;
          category = #normal;
          imageData = null;
          status = #available;
        },
      ),
      (
        "Los Tralaleritos",
        {
          name = "Los Tralaleritos";
          price = 0.42;
          category = #normal;
          imageData = null;
          status = #available;
        },
      ),
    ];

    products.clear();
    for ((name, product) in initialProducts.values()) {
      products.add(name, product);
    };
  };

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query func isBackendInitialized() : async Bool {
    isInitialized;
  };

  public shared ({ caller }) func login(username : Text) : async AccessControl.UserRole {
    if (not isValidUsername(username)) {
      Runtime.trap("Invalid username. Please use a valid username!");
    };

    let newSession : Session = {
      principal = caller;
      username = username;
    };
    sessions.add(caller, newSession);

    userProfiles.add(caller, { name = username });

    let role = getRoleForUsername(username);

    role;
  };

  func getRoleForUsername(username : Text) : AccessControl.UserRole {
    if (username == "Steven") {
      #admin;
    } else {
      #user;
    };
  };

  public query ({ caller }) func getProductsByCategory(category : Category) : async [Product] {
    products.values().toArray().filter(
      func(product) {
        product.category == category;
      }
    ).sort();
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query ({ caller }) func getProduct(name : Text) : async Product {
    switch (products.get(name)) {
      case (null) { Runtime.trap("Product not found!") };
      case (?product) { product };
    };
  };

  public shared ({ caller }) func buyProduct(productName : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can buy products");
    };

    let username = switch (getUsernameForCaller(caller)) {
      case (?u) { u };
      case null { caller.toText() };
    };

    switch (products.get(productName)) {
      case (null) { Runtime.trap("Product not found!") };
      case (?product) {
        if (product.status == #soldOut) {
          Runtime.trap("Product is already sold out");
        };

        let newPurchase : Purchase = {
          username;
          productName;
          price = product.price;
          confirmed = false;
        };

        let currentId = purchaseCounter;
        purchaseCounter += 1;
        pendingPurchases.add(currentId, newPurchase);
        currentId;
      };
    };
  };

  public query ({ caller }) func getPendingPurchases() : async [(Nat, Purchase)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pending purchases");
    };
    pendingPurchases.toArray();
  };

  public query ({ caller }) func getConfirmedPurchases() : async [(Nat, Purchase)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view confirmed purchases");
    };
    confirmedPurchases.toArray();
  };

  public shared ({ caller }) func acceptPurchase(purchaseIdToAccept : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can accept purchases");
    };

    switch (pendingPurchases.get(purchaseIdToAccept)) {
      case (null) { Runtime.trap("Purchase not found!") };
      case (?purchase) {
        confirmedPurchases.add(purchaseIdToAccept, purchase);
        pendingPurchases.remove(purchaseIdToAccept);

        switch (products.get(purchase.productName)) {
          case (null) { Runtime.trap("Product not found!") };
          case (?product) {
            products.add(
              purchase.productName,
              {
                name = product.name;
                price = product.price;
                category = product.category;
                imageData = product.imageData;
                status = #soldOut;
              },
            );
          };
        };
      };
    };
  };

  public shared ({ caller }) func declinePurchase(purchaseIdToDecline : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can decline purchases");
    };

    switch (pendingPurchases.get(purchaseIdToDecline)) {
      case (null) { () }; // Nothing to do if ID not present
      case (?_) {
        pendingPurchases.remove(purchaseIdToDecline);
      };
    };
  };

  public shared ({ caller }) func deleteConfirmedPurchase(purchaseIdToDelete : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete confirmed purchases");
    };

    switch (confirmedPurchases.get(purchaseIdToDelete)) {
      case (null) { Runtime.trap("Purchase not found!") };
      case (?purchase) {
        confirmedPurchases.remove(purchaseIdToDelete);

        switch (products.get(purchase.productName)) {
          case (null) { () };
          case (?product) {
            products.add(
              purchase.productName,
              {
                name = product.name;
                price = product.price;
                category = product.category;
                imageData = product.imageData;
                status = #available;
              },
            );
          };
        };
      };
    };
  };

  public shared ({ caller }) func addProduct(name : Text, price : Float, category : Category, imageData : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let newProduct : Product = {
      name;
      price;
      category;
      imageData;
      status = #available;
    };

    products.add(name, newProduct);
  };

  public shared ({ caller }) func deleteProduct(productName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    switch (products.get(productName)) {
      case (null) { Runtime.trap("Product not found!") };
      case (?_) {
        products.remove(productName);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  system func preupgrade() {
    performInitialSetup();
  };

  system func postupgrade() {
    performInitialSetup();
  };

  performInitialSetup();
};

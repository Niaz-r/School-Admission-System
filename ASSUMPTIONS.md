
# Assumptions and Design Decisions

1. **Student Identification:** A student's 17-digit Birth Registration Number is used as the unique student identifier.

2. **Student Authentication:** No login or password-based authentication is required. Student-specific API requests identify the student through the `X-Student-Id` HTTP header.

3. **Class and Shift:** Each class and shift combination represents a separate admission group with its own seat capacity.

4. **Admission Order:** Admission follows First-Come, First-Served (FCFS). No lottery or random selection is used.

5. **Temporary Seat Hold:** A successful reservation creates a temporary hold lasting 10 minutes.

6. **Hold Expiration:** If a hold is not confirmed before expiration, its status becomes `EXPIRED` and its seat becomes available again.

7. **Admission Confirmation:** The payment button simulates successful payment. No external payment gateway is integrated.

8. **Confirmed Admission:** Once confirmed, an admission occupies a seat and cannot be cancelled through the temporary-hold cancellation endpoint.

9. **Duplicate Applications:** A student cannot have multiple active holds or confirmed admissions for the same class.

10. **Concurrency:** Database transactions and row-level locking are used to prevent multiple students from reserving the same remaining seat.

11. **Admin Access:** A simple admin page is provided for class creation. Full role-based authentication is outside the scope of this assignment.

12. **Database:** PostgreSQL is used as the persistent database. Entity Framework Core manages database access and migrations.

13. **Testing:** Automated tests use a separate PostgreSQL test database to avoid changing application data.

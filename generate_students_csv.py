import csv
import random

def generate_sample_csv(filename="sample_students.csv", num_students=10):
    headers = ["email", "fullName", "prn", "branch", "currentCgpa", "passingYear"]
    
    first_names = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Siddharth", "Neha", "Arjun", "Kavita"]
    last_names = ["Sharma", "Verma", "Gupta", "Patel", "Mehta", "Singh", "Joshi", "Deshmukh", "Kulkarni", "Reddy"]
    branches = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"]
    
    students = []
    
    for i in range(num_students):
        first = random.choice(first_names)
        last = random.choice(last_names)
        full_name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}{random.randint(10, 99)}@university.edu"
        prn = str(20230000 + i + 1)
        branch = random.choice(branches)
        cgpa = round(random.uniform(6.5, 9.8), 2)
        passing_year = 2026
        
        students.append({
            "email": email,
            "fullName": full_name,
            "prn": prn,
            "branch": branch,
            "currentCgpa": cgpa,
            "passingYear": passing_year
        })
    
    with open(filename, mode='w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(students)
    
    print(f"Successfully generated {filename} with {num_students} student records.")

if __name__ == "__main__":
    generate_sample_csv()

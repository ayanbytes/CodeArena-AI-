import os
from dotenv import load_dotenv
from database import supabase

load_dotenv()

ALL_QUESTIONS = [
    # EASY: Basics, Strings, Lists, Loops, Dicts, Basic Functions
    {
        "title": "1. Hello World (Python)",
        "description": "Write a Python script that takes a name as input and prints 'Hello, {name}!'",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "Alice", "expected_output": "Hello, Alice!", "is_hidden": False},
            {"input": "Bob", "expected_output": "Hello, Bob!", "is_hidden": True}
        ]
    },
    {
        "title": "2. String Formatting",
        "description": "Given two inputs, `name` and `age`, print them using an f-string in the format: 'My name is {name} and I am {age} years old.'",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "John\n25", "expected_output": "My name is John and I am 25 years old.", "is_hidden": False},
            {"input": "Jane\n30", "expected_output": "My name is Jane and I am 30 years old.", "is_hidden": True}
        ]
    },
    {
        "title": "3. List Slicing",
        "description": "Given a string, print the first 3 characters, then the last 3 characters, separated by a space. Use Python's slice notation.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "programming", "expected_output": "pro ing", "is_hidden": False},
            {"input": "python", "expected_output": "pyt hon", "is_hidden": True}
        ]
    },
    {
        "title": "4. List Append & Remove",
        "description": "Read a list of integers (space-separated). Append `99` to the list, remove the first element, and print the resulting list as space-separated values.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "1 2 3 4", "expected_output": "2 3 4 99", "is_hidden": False},
            {"input": "10 20", "expected_output": "20 99", "is_hidden": True}
        ]
    },
    {
        "title": "5. Dictionary Access",
        "description": "You are given a dictionary `d = {'a': 1, 'b': 2, 'c': 3}`. The user inputs a key. Print its value. If the key doesn't exist, print 'Not Found'. (Use the `.get()` method).",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "b", "expected_output": "2", "is_hidden": False},
            {"input": "z", "expected_output": "Not Found", "is_hidden": False},
            {"input": "c", "expected_output": "3", "is_hidden": True}
        ]
    },
    {
        "title": "6. Dictionary Update",
        "description": "Read two inputs: a string `key` and an integer `val`. Create a dictionary `{'a': 1}` and update it with the new key-value pair. Then print the dictionary keys sorted.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "b\n2", "expected_output": "a b", "is_hidden": False},
            {"input": "c\n3", "expected_output": "a c", "is_hidden": True}
        ]
    },
    {
        "title": "7. Set Operations (Union)",
        "description": "Read two space-separated lists of integers. Convert them to sets, find their union, sort it, and print it space-separated.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "1 2 3\n3 4 5", "expected_output": "1 2 3 4 5", "is_hidden": False},
            {"input": "1 1 2\n2 3 3", "expected_output": "1 2 3", "is_hidden": True}
        ]
    },
    {
        "title": "8. For Loop (Sum)",
        "description": "Use a `for` loop to calculate the sum of a given space-separated list of integers and print the sum.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "1 2 3 4", "expected_output": "10", "is_hidden": False},
            {"input": "-1 5 10", "expected_output": "14", "is_hidden": True}
        ]
    },
    {
        "title": "9. While Loop (Count Down)",
        "description": "Given an integer `N`, use a `while` loop to print numbers from `N` down to 1, space-separated.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "5", "expected_output": "5 4 3 2 1", "is_hidden": False},
            {"input": "3", "expected_output": "3 2 1", "is_hidden": True}
        ]
    },
    {
        "title": "10. Basic Function",
        "description": "Write a function `multiply(a, b)` that returns the product. Read two integers from input, call your function, and print the result.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "3\n4", "expected_output": "12", "is_hidden": False},
            {"input": "-2\n5", "expected_output": "-10", "is_hidden": True}
        ]
    },
    {
        "title": "11. Default Arguments",
        "description": "Write a function `greet(name, greeting=\"Hello\")`. Read a name and an optional greeting (which may be empty). If empty, use the default. Print the result.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "Alice\nHi", "expected_output": "Hi Alice", "is_hidden": False},
            {"input": "Bob\n", "expected_output": "Hello Bob", "is_hidden": True}
        ]
    },
    {
        "title": "12. Lambda Functions",
        "description": "Write a lambda function that squares a number. Read an integer, apply the lambda, and print the result.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "4", "expected_output": "16", "is_hidden": False},
            {"input": "9", "expected_output": "81", "is_hidden": True}
        ]
    },
    {
        "title": "13. List Comprehension (Basics)",
        "description": "Given a space-separated list of integers, use a list comprehension to square each number. Print the new list space-separated.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "1 2 3", "expected_output": "1 4 9", "is_hidden": False},
            {"input": "-1 -2 0", "expected_output": "1 4 0", "is_hidden": True}
        ]
    },
    {
        "title": "14. Try-Except Basics",
        "description": "Read two integers `a` and `b`. Print `a // b`. Use a `try...except ZeroDivisionError` block to catch division by zero and print 'Cannot divide by zero'.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "10\n2", "expected_output": "5", "is_hidden": False},
            {"input": "5\n0", "expected_output": "Cannot divide by zero", "is_hidden": False},
            {"input": "9\n3", "expected_output": "3", "is_hidden": True}
        ]
    },
    {
        "title": "15. Type Casting",
        "description": "Read a float as a string (e.g., '3.14'). Convert it to a float, then cast it to an int, and print the int.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "3.14", "expected_output": "3", "is_hidden": False},
            {"input": "9.99", "expected_output": "9", "is_hidden": True}
        ]
    },
    {
        "title": "16. String Methods",
        "description": "Read a string. Print it entirely in uppercase, then entirely in lowercase, space-separated.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "PyThOn", "expected_output": "PYTHON python", "is_hidden": False},
            {"input": "HeLlO", "expected_output": "HELLO hello", "is_hidden": True}
        ]
    },
    {
        "title": "17. Finding in Lists",
        "description": "Read a list of words, then read a target word. Use the `in` operator to check if it exists. Print 'Found' or 'Not Found'.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "apple banana cherry\nbanana", "expected_output": "Found", "is_hidden": False},
            {"input": "apple banana\nkiwi", "expected_output": "Not Found", "is_hidden": True}
        ]
    },
    {
        "title": "18. Enumeration",
        "description": "Read a list of words. Use `enumerate()` to print each word along with its index, formatted as '0:word1 1:word2' etc.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "a b c", "expected_output": "0:a 1:b 2:c", "is_hidden": False},
            {"input": "hello world", "expected_output": "0:hello 1:world", "is_hidden": True}
        ]
    },
    {
        "title": "19. Min and Max",
        "description": "Read a list of integers. Use Python's built-in `min()` and `max()` functions to print the minimum and maximum values, space-separated.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "4 1 9 3", "expected_output": "1 9", "is_hidden": False},
            {"input": "-5 0 5", "expected_output": "-5 5", "is_hidden": True}
        ]
    },
    {
        "title": "20. Boolean Logic",
        "description": "Read two boolean values (True/False). Print the result of `a and b`, then `a or b`, space-separated.",
        "difficulty": "Easy",
        "test_cases": [
            {"input": "True\nFalse", "expected_output": "False True", "is_hidden": False},
            {"input": "True\nTrue", "expected_output": "True True", "is_hidden": True}
        ]
    },

    # MEDIUM: Advanced Comprehensions, Map/Filter, OOP Basics, Generators
    {
        "title": "21. List Comprehension (Conditionals)",
        "description": "Given a list of integers, use a list comprehension to return a list containing only the even numbers. Print them space-separated.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "1 2 3 4 5 6", "expected_output": "2 4 6", "is_hidden": False},
            {"input": "10 15 20", "expected_output": "10 20", "is_hidden": True}
        ]
    },
    {
        "title": "22. Dictionary Comprehension",
        "description": "Read a list of words. Use a dictionary comprehension to create a dict mapping each word to its length. Print the values sorted by their keys.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "apple pie", "expected_output": "5 3", "is_hidden": False},
            {"input": "a bb ccc", "expected_output": "1 2 3", "is_hidden": True}
        ]
    },
    {
        "title": "23. *args",
        "description": "Write a function `sum_all(*args)` that sums all arguments passed to it. Read a list of integers, pass them unpacked to the function, and print the sum.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "1 2 3", "expected_output": "6", "is_hidden": False},
            {"input": "10 20 30 40", "expected_output": "100", "is_hidden": True}
        ]
    },
    {
        "title": "24. **kwargs",
        "description": "Write a function `print_kwargs(**kwargs)` that prints keys and values sorted by key in the format `k=v`. Read two key-value pairs and pass them.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "name Alice age 30", "expected_output": "age=30 name=Alice", "is_hidden": False},
            {"input": "z 1 a 2", "expected_output": "a=2 z=1", "is_hidden": True}
        ]
    },
    {
        "title": "25. Map Function",
        "description": "Use the `map()` function and a lambda to multiply a list of integers by 3. Print the result space-separated.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "1 2 3", "expected_output": "3 6 9", "is_hidden": False},
            {"input": "0 -1", "expected_output": "0 -3", "is_hidden": True}
        ]
    },
    {
        "title": "26. Filter Function",
        "description": "Use the `filter()` function and a lambda to filter out words that are shorter than 4 characters from a list. Print the result space-separated.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "cat dog bird elephant", "expected_output": "bird elephant", "is_hidden": False},
            {"input": "a bb ccc dddd", "expected_output": "dddd", "is_hidden": True}
        ]
    },
    {
        "title": "27. Zip Function",
        "description": "Read two lists of equal length. Use `zip()` to combine them into a list of tuples, then format each tuple as 'a:b' and print space-separated.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "a b c\n1 2 3", "expected_output": "a:1 b:2 c:3", "is_hidden": False},
            {"input": "x y\n9 8", "expected_output": "x:9 y:8", "is_hidden": True}
        ]
    },
    {
        "title": "28. Custom Generators (yield)",
        "description": "Write a generator function `evens(n)` that `yield`s even numbers from 0 up to `n`. Read `n`, listify the generator, and print.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "6", "expected_output": "0 2 4 6", "is_hidden": False},
            {"input": "3", "expected_output": "0 2", "is_hidden": True}
        ]
    },
    {
        "title": "29. Basic Decorators",
        "description": "Write a decorator `@uppercase` that converts the returned string of a function to uppercase. Apply it to a function that returns user input.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "hello", "expected_output": "HELLO", "is_hidden": False},
            {"input": "python is fun", "expected_output": "PYTHON IS FUN", "is_hidden": True}
        ]
    },
    {
        "title": "30. OOP: Basic Class",
        "description": "Create a `Person` class with an `__init__(name, age)` method and a `greet()` method returning 'Hi, I am {name}'. Instantiate and call it.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "Alice\n20", "expected_output": "Hi, I am Alice", "is_hidden": False},
            {"input": "Bob\n30", "expected_output": "Hi, I am Bob", "is_hidden": True}
        ]
    },
    {
        "title": "31. OOP: Inheritance",
        "description": "Create an `Animal` class with a `speak()` method returning '...'. Create a `Dog` class that inherits `Animal` and overrides `speak()` to return 'Woof'. Print Dog().speak().",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "test", "expected_output": "Woof", "is_hidden": False},
            {"input": "run", "expected_output": "Woof", "is_hidden": True}
        ]
    },
    {
        "title": "32. Magic Methods (__str__)",
        "description": "Create a `Point(x, y)` class and override `__str__` to return '(x, y)'. Read x and y, instantiate, and print the object.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "3\n4", "expected_output": "(3, 4)", "is_hidden": False},
            {"input": "0\n0", "expected_output": "(0, 0)", "is_hidden": True}
        ]
    },
    {
        "title": "33. Magic Methods (__add__)",
        "description": "Override `__add__` in `Point(x, y)` to add the coordinates of two Points and return a new Point. Print the resulting point.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "1 2\n3 4", "expected_output": "(4, 6)", "is_hidden": False},
            {"input": "0 1\n1 0", "expected_output": "(1, 1)", "is_hidden": True}
        ]
    },
    {
        "title": "34. Datetime Module",
        "description": "Import `datetime`. Given a date string 'YYYY-MM-DD', parse it using `strptime` and print the year.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "2023-10-15", "expected_output": "2023", "is_hidden": False},
            {"input": "1999-01-01", "expected_output": "1999", "is_hidden": True}
        ]
    },
    {
        "title": "35. Math Module",
        "description": "Import `math`. Read a float, calculate its square root, and round it UP using `math.ceil()`. Print the integer.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "10.0", "expected_output": "4", "is_hidden": False},
            {"input": "16.0", "expected_output": "4", "is_hidden": True}
        ]
    },
    {
        "title": "36. Collections: Counter",
        "description": "Import `Counter` from `collections`. Read a string of words. Use Counter to find the frequency of each word. Print the most common word.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "apple banana apple", "expected_output": "apple", "is_hidden": False},
            {"input": "dog cat dog dog bird", "expected_output": "dog", "is_hidden": True}
        ]
    },
    {
        "title": "37. Any and All",
        "description": "Read a list of booleans (True/False). Use Python's built-in `any()` and `all()` and print their results space-separated.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "True False True", "expected_output": "True False", "is_hidden": False},
            {"input": "True True", "expected_output": "True True", "is_hidden": True}
        ]
    },
    {
        "title": "38. Sort vs Sorted",
        "description": "Read a list of numbers. Use `sorted()` to print a sorted version, then print the original (which should remain unsorted). Use string formatting to output 'sorted: [..] original: [..]'.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "3 1 2", "expected_output": "sorted: [1, 2, 3] original: [3, 1, 2]", "is_hidden": False},
            {"input": "5 4", "expected_output": "sorted: [4, 5] original: [5, 4]", "is_hidden": True}
        ]
    },
    {
        "title": "39. Multiple Exceptions",
        "description": "Read two inputs. Try to divide them. Catch `ValueError` (if not an int) and `ZeroDivisionError`. Print 'Value Error' or 'Zero Error' respectively, otherwise the result.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "10\na", "expected_output": "Value Error", "is_hidden": False},
            {"input": "5\n0", "expected_output": "Zero Error", "is_hidden": False},
            {"input": "6\n2", "expected_output": "3.0", "is_hidden": True}
        ]
    },
    {
        "title": "40. Global vs Local Scope",
        "description": "Declare a global variable `x = 10`. Write a function that uses the `global` keyword to change `x` to the user's input. Call it and print `x`.",
        "difficulty": "Medium",
        "test_cases": [
            {"input": "50", "expected_output": "50", "is_hidden": False},
            {"input": "99", "expected_output": "99", "is_hidden": True}
        ]
    },

    # HARD: Advanced Decorators, Itertools, Functools, Regex, Async concepts
    {
        "title": "41. Decorators with Arguments",
        "description": "Write a decorator `@repeat(n)` that executes the decorated function `n` times, printing its output each time. Read `n` and a string to print.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "3\nhi", "expected_output": "hi hi hi", "is_hidden": False},
            {"input": "2\npython", "expected_output": "python python", "is_hidden": True}
        ]
    },
    {
        "title": "42. Property Decorators",
        "description": "Create a class `Circle` with a private `_radius`. Use `@property` for `radius` and a `@radius.setter` that prevents negative values (prints 'Invalid'). Read a value, try to set it.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "-5", "expected_output": "Invalid", "is_hidden": False},
            {"input": "10", "expected_output": "10", "is_hidden": True}
        ]
    },
    {
        "title": "43. Context Managers (__enter__, __exit__)",
        "description": "Create a custom Context Manager class `Timer` that prints 'Enter' on enter and 'Exit' on exit. Use it in a `with` block that prints 'Inside'.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "run", "expected_output": "Enter\nInside\nExit", "is_hidden": False},
            {"input": "test", "expected_output": "Enter\nInside\nExit", "is_hidden": True}
        ]
    },
    {
        "title": "44. Multiple Inheritance and MRO",
        "description": "Class A prints 'A', B(A) prints 'B', C(A) prints 'C', D(B,C) calls `super().foo()`. Observe the Method Resolution Order. Just output the correct MRO sequence for D.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "run", "expected_output": "D B C A", "is_hidden": False},
            {"input": "test", "expected_output": "D B C A", "is_hidden": True}
        ]
    },
    {
        "title": "45. Class Methods (@classmethod)",
        "description": "Create a class `User` with a class variable `count=0`. Use a `@classmethod` to increment it upon instantiation. Instantiate N times and print the class method output.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "3", "expected_output": "3", "is_hidden": False},
            {"input": "5", "expected_output": "5", "is_hidden": True}
        ]
    },
    {
        "title": "46. Static Methods (@staticmethod)",
        "description": "Create a class `MathUtils` with a `@staticmethod` `is_even(n)`. Read an integer and call the static method on the class directly. Print True/False.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "4", "expected_output": "True", "is_hidden": False},
            {"input": "7", "expected_output": "False", "is_hidden": True}
        ]
    },
    {
        "title": "47. Itertools: Permutations",
        "description": "Import `permutations` from `itertools`. Given a string of length 3, print all permutations alphabetically sorted, space-separated.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "abc", "expected_output": "abc acb bac bca cab cba", "is_hidden": False},
            {"input": "xyz", "expected_output": "xyz xzy yxz yzx zxy zyx", "is_hidden": True}
        ]
    },
    {
        "title": "48. Itertools: Groupby",
        "description": "Import `groupby` from `itertools`. Given a sorted string 'AAABBBCC', group characters and print keys space-separated.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "AAABBBCC", "expected_output": "A B C", "is_hidden": False},
            {"input": "XXYYZ", "expected_output": "X Y Z", "is_hidden": True}
        ]
    },
    {
        "title": "49. Collections: DefaultDict",
        "description": "Import `defaultdict` from `collections`. Create one with `int`. Read a list of words and count them. It should default to 0 for missing. Print the count of 'apple'.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "apple banana apple", "expected_output": "2", "is_hidden": False},
            {"input": "banana orange", "expected_output": "0", "is_hidden": True}
        ]
    },
    {
        "title": "50. Collections: NamedTuple",
        "description": "Import `namedtuple` from `collections`. Create a `Point` with `x` and `y`. Instantiate it with user inputs and print `p.x` and `p.y`.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "10 20", "expected_output": "10 20", "is_hidden": False},
            {"input": "5 5", "expected_output": "5 5", "is_hidden": True}
        ]
    },
    {
        "title": "51. Collections: Deque",
        "description": "Import `deque` from `collections`. Initialize it with a list. Use `appendleft()` and `pop()` as dictated by user input. Print resulting list.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "1 2 3\nappendleft 0", "expected_output": "0 1 2 3", "is_hidden": False},
            {"input": "1 2 3\npop", "expected_output": "1 2", "is_hidden": True}
        ]
    },
    {
        "title": "52. Functools: lru_cache",
        "description": "Import `lru_cache` from `functools`. Decorate a recursive `fibonacci(n)` function. (Used to heavily speed up execution). Read `n` and output fib(n).",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "10", "expected_output": "55", "is_hidden": False},
            {"input": "30", "expected_output": "832040", "is_hidden": True}
        ]
    },
    {
        "title": "53. Functools: partial",
        "description": "Import `partial` from `functools`. Create a function `power(base, exp)`. Use `partial` to create a `square` function where `exp=2`. Read a base and use `square(base)`.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "5", "expected_output": "25", "is_hidden": False},
            {"input": "8", "expected_output": "64", "is_hidden": True}
        ]
    },
    {
        "title": "54. Regex: Findall",
        "description": "Import `re`. Given a string, use `re.findall()` to extract all numbers (digits) and print them space-separated.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "I have 2 apples and 10 bananas", "expected_output": "2 10", "is_hidden": False},
            {"input": "No numbers here", "expected_output": "", "is_hidden": True}
        ]
    },
    {
        "title": "55. Regex: Sub",
        "description": "Import `re`. Use `re.sub()` to replace all vowels in a string with '*'. Print the masked string.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "hello world", "expected_output": "h*ll* w*rld", "is_hidden": False},
            {"input": "python", "expected_output": "pyth*n", "is_hidden": True}
        ]
    },
    {
        "title": "56. Generator Expressions",
        "description": "Similar to list comprehensions but with parentheses. Create a generator expression for squares of a list of numbers. Use `next()` to print the first square.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "3 4 5", "expected_output": "9", "is_hidden": False},
            {"input": "10 20", "expected_output": "100", "is_hidden": True}
        ]
    },
    {
        "title": "57. Walrus Operator (:=)",
        "description": "Python 3.8+ introduced the walrus operator `:=`. Write an if statement that assigns the length of a string to `n` and checks if `n > 5`. Print `n` if true, else 'short'.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "elephant", "expected_output": "8", "is_hidden": False},
            {"input": "dog", "expected_output": "short", "is_hidden": True}
        ]
    },
    {
        "title": "58. Assert Statements",
        "description": "Write a script that reads an integer `x`. Use `assert x > 0, 'Negative'` to ensure it is positive. Catch `AssertionError` and print the error message.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "-5", "expected_output": "Negative", "is_hidden": False},
            {"input": "10", "expected_output": "10", "is_hidden": True}
        ]
    },
    {
        "title": "59. Type Hinting",
        "description": "Write a function signature `def greet(name: str) -> str:`. Have it return the name. (This tests syntax validity). Read a name and print it.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "Alice", "expected_output": "Alice", "is_hidden": False},
            {"input": "Bob", "expected_output": "Bob", "is_hidden": True}
        ]
    },
    {
        "title": "60. Exception Chaining (raise from)",
        "description": "Write a block that catches a `ValueError` and raises a `TypeError` `from` the original exception. Catch the `TypeError` and print `__cause__.__class__.__name__`.",
        "difficulty": "Hard",
        "test_cases": [
            {"input": "run", "expected_output": "ValueError", "is_hidden": False},
            {"input": "test", "expected_output": "ValueError", "is_hidden": True}
        ]
    }
]

def run():
    print(f"Seeding {len(ALL_QUESTIONS)} Python-specific questions into question_bank...")
    success_count = 0
    for q in ALL_QUESTIONS:
        try:
            resp = supabase.table('question_bank').insert(q).execute()
            if resp.data:
                success_count += 1
                print(f"✅ Inserted: {q['title']}")
        except Exception as e:
            print(f"❌ Failed to insert '{q['title']}': {e}")
            
    print(f"\\nDone! Successfully seeded {success_count} Python questions.")

if __name__ == "__main__":
    run()

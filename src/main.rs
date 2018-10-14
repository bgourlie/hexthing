use std::ops::{Add, Sub};

#[derive(Eq, PartialEq)]
struct Hex {
    q: i32,
    r: i32,
    s: i32
}

impl Hex {
    fn new(q: i32, r: i32) -> Self {
        Hex { q, r, s: (-1 * q) - r}
    }

    fn q(&self) -> i32 {
        self.q
    }

    fn r(&self) -> i32 {
        self.r
    }

    fn s(&self) -> i32 {
        self.s
    }
}

impl Add for Hex {
    type Output = Hex;

    fn add(self, rhs: Self) -> <Self as Add<Self>>::Output {
        Hex::new(self.q + rhs.q, self.r + rhs.r)
    }
}

impl Sub for Hex {
    type Output = Hex;

    fn sub(self, rhs: Self) -> <Self as Add<Self>>::Output {
        Hex::new(self.q - rhs.q, self.r - rhs.r)
    }
}

fn main() {
    println!("Hello, world!");
}

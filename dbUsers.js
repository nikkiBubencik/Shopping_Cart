const users = [
    { id: '1', name: 'Alice',   username: 'alice',      
          password: '1234',    role: 'user' },
    { id: '2', name: 'Bob',     username: 'bob',        
          password: '2345',    role: 'user' },
    { id: '3', name: 'Charlie', username: 'charlie',    
          password: '3456',    role: 'admin' },   
]

export function findUser (name) {
  return users.find(user => 
            user.username == name);
}

export async function  validateUser(name, password) {
  return users.find(user => 
            user.username == name && user.password == password);
}

import Vist from './index';

new Vist({ remoteUrl: 'http://127.0.0.1:3000', pid: 1, requestMock: ['63459b8739ca915a6903c126.mockapi.io/**'] });
fetch('https://63459b8739ca915a6903c126.mockapi.io/api/users')
  .then((response) => response.json())
  .then((json) => console.log(json));

fetch('https://63459b8739ca915a6903c12.mockapi.io/api/users')
  .then((response) => response.json())
  .then((json) => console.log(json));

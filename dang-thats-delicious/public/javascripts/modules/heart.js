import axios from 'axios';
import { $ } from './bling';

function ajaxHeart(e) {
  // Prevenir que el browser realice el post para no redirigir la pagina
  e.preventDefault();
  // Manejar el evento post desde javascript
  axios
    .post(this.action)
    .then(res => {
      const isHearted = this.heart.classList.toggle('heart__button--hearted');
      $('.heart-count').textContent = res.data.hearts.length;
      if (isHearted) {
        this.heart.classList.add('heart__button--float');
        // Se usa arrow function asi "this" se refiere al form
        setTimeout(() => {
          this.heart.classList.remove('heart__button--float');
        }, 2500);
      }
    })
    .catch(console.error);
}

export default ajaxHeart;

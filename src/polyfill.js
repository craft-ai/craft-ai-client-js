if (Promise.allSettled === undefined) {
  Promise.allSettled = (array) => Promise.all(array.map((element) => {
    return new Promise((resolve) => resolve(element))
      .then((result) => ({ status: 'fulfilled', value: result }))
      .catch((err) => ({ status: 'rejected', reason: err }));
  }));
}

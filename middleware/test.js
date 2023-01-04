export default function (context) {
  console.log('logged in with email not verified');
  console.log(context.route.meta)
  return context.redirect('/hello');
}

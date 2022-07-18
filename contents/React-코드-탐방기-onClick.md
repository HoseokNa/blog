---
date: '2022-07-17'
title: 'React 코드 탐방기(onClick 바인딩)'
categories: ['React']
summary: '이벤트 바인딩이 궁금해서 찾아본 React 코드'
thumbnail: './thumbnails/react-onClick.png'
---

# React 코드 탐방기 (onClick)

담당한 이슈 중에 조건에 따라 onClick 바인딩을 해제해야할 일이 생겼다.

`onClick={undefined}`, `onClick={null}` 두 개의 코드 모두 바인딩이 안되는 걸 확인했다.

처음에는 당연히 함수가 아니기 때문에 함수로 실행하려다가 에러가 발생하지 않을까? 라는 생각이 들었었는데 에러는 발생하지 않고 onClick이 바인딩 되지 않는 동작을 잘 수행했다.

React가 해당 값을 분기 처리하겠구나라는 로직이 유추가 됐지만 어떻게 동작하고 있는지, 코드가 어떻게 작성 됐을지 궁금해졌다.

실제로도 React 코드를 본 적이 한번도 없었기 떄문에 이 기회를 통해 살펴 보기로 했다.

## 1. undefined와 null이 바인딩 안되는 이유 (결론먼저)

```js
// react-dom/src/events/DOMPluginEventSystem.js

// Standard React on* listeners, i.e. onClick or onClickCapture
if (reactEventName !== null) {
  const listener = getListener(instance, reactEventName)
  if (listener != null) {
    listeners.push(
      createDispatchListener(instance, listener, lastHostComponent),
    )
  }
}
```

결론부터 먼저 말하면 위의 코드 부분이 바인딩을 할 수 없게 하는 부분이다.

정확히는 이벤트가 발생할 때 마다 위의 코드가 실행이 된다.

`listener` 에는 이벤트가 발생했을 때 실행하는 callback 함수가 `getListenr` 함수를 통해 할당이 된다.

`if (listener != null)` 조건에서 `undefined`와 `null`은 조건을 통과할 수 없게 된다. 당연히 바인딩도 일어나지 않게 된다. 그래서 이벤트가 발생해도 함수가 아닌 값을 함수처럼 실행할 일이 없게 된 것이였다.

결론은 간단했지만 찾아오는 과정은 쉽지가 않았다.

## 2. node_modules vs github

먼저 React 코드를 어디에서 봐야할지를 몰랐다.

아니 정확히는 React 코드가 어디있는지는 알았지만 코드가 서로 달라서 당황스러웠다.

React를 설치해서 사용하고 있었기 때문에 `node_modules` 폴더 안에 코드가 있는걸 알았고 React `Github`에 코드가 있다는건 이미 알고 있는 사실이였다. 그런데 둘의 구조와 코드가 다르니까 여기서부터 이해가 안됐다.

![react-dom](https://user-images.githubusercontent.com/16220817/179518762-1fa0be14-edec-466b-92ba-11293bef04b4.png)

심지어 코드가 상당히 길거나(거의 3만줄) 알아볼 수 없는 코드로 작성 됐었다.

![node_nodules react-dom](https://user-images.githubusercontent.com/16220817/179520893-d62edcc8-3654-489d-a109-5efd49df556e.png)

방대한 코드에서 내가 원하는 곳을 못찾고 있었는데 이런 차이도 있으니 더 이해가 안됐다.

고민 중에 동영 멘토님이 도움을 주셔서 둘의 차이점을 알게 됐다.

### 차이점은 build

우리가 npm으로 설치하는 package는 build 된 결과물을 설치해서 사용하는 것이였다.

실제 모든 코드를 그대로 올려서 사용하면 용량이 매우 크다. 그래서 용량을 줄인 결과물을 유저들이 사용할 수 있게 최적화 된 파일을 제공해서 차이가 생겼던 것이였다.

이런 이유 때문에 `node_modules` 에 있는 파일로 파악하기는 힘들고 `Github`에 있는 코드로 파악하는게 더 수월했다.

## 3. node_modules 코드 수정하기

코드를 따라가면서 대략적인 위치를 잡았다.

하지만 확신을 할 수 없으니 `console.log` 로 내가 생각한 위치가 맞는지 확인하고 싶었다.

확인 후 역시나 안나오는걸 보고 잘못 찾았구나 싶었다. 하지만 코드 시작점부터 `console.log`가 나오지 않는걸 보고서 잘못됨을 느꼈다.

### .cache 삭제

이 부분은 정확한 원인과 원리를 파악하지는 못했다.

하지만 나는 `node_modules/.cache` 폴더를 삭제하면서 해결할 수 있었다.

테스트는 CRA 환경으로 만들어서 하고 있었는데 `npm run start`로 실행하고 `.cache` 폴더가 생성되면 이후에 `node_modules`에 내용을 수정해도 해당 내용은 반영이 안됐다.

하지만 `.cache` 폴더를 삭제한 후 빌드가 다시 진행 되면 수정 내용이 반영됨을 확인 할 수 있었다.

이를 통해 내가 찾는 부분이 맞는지 확인 할 수 있었다.

## 4. 이벤트 바인딩 관련 경고 순서

### 경고

```js
// react-dom/src/client/ReactDomComponent.js

warnForInvalidEventListener = function (registrationName, listener) {
  if (listener === false) {
    console.error(
      'Expected `%s` listener to be a function, instead got `false`.\n\n' +
        'If you used to conditionally omit it with %s={condition && value}, ' +
        'pass %s={condition ? value : undefined} instead.',
      registrationName,
      registrationName,
      registrationName,
    )
  } else {
    console.error(
      'Expected `%s` listener to be a function, instead got a value of `%s` type.',
      registrationName,
      typeof listener,
    )
  }
}

// ...

function setInitialDOMProperties(
  tag: string,
  domElement: Element,
  rootContainerElement: Element | Document | DocumentFragment,
  nextProps: Object,
  isCustomComponentTag: boolean,
): void {
  // ...

  else if (registrationNameDependencies.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        if (__DEV__ && typeof nextProp !== 'function') {
          warnForInvalidEventListener(propKey, nextProp);
        }

        // ...
      }
  }

  // ...
}

```

처음 dom이 생성될 때 바인딩 된 callback이 함수가 아니면 `warnForInvalidEventListener`를 실행하여 경고를 콘솔로 보여준다.

만약에 callback 값이 `false` 이면 `{condition && value}` 대신에 `{condition ? value : undefined}`를 사용하라고 경고한다.

그 외에는 type이 함수가 아니라고 경고한다.

### 에러

```js
// react-dom/src/events/getListner.js

/**
 * @param {object} inst The instance, which is the source of events.
 * @param {string} registrationName Name of listener (e.g. `onClick`).
 * @return {?function} The stored callback.
 */
export default function getListener(
  inst: Fiber,
  registrationName: string,
): Function | null {
  // ...

  const listener = props[registrationName]
  // ...

  if (listener && typeof listener !== 'function') {
    throw new Error(
      `Expected \`${registrationName}\` listener to be a function, instead got a value of \`${typeof listener}\` type.`,
    )
  }

  return listener
}
```

이벤트가 발생하면 이 글의 맨 처음에 보여줬던 코드가 실행이 되고 그 코드에서는 `getListener`를 활용해서 `listener`를 받아온다.

하지만 함수가 아니라면 callback의 값인 `listener`를 함수로 실행시킬 수 없기 때문에 React는 함수로 실행하지는 않고 `throw new Error`를 던져서 에러를 발생시킨다.

하지만 위의 코드를 잘보면

```js
if (listener && typeof listener !== 'function')
```

`listener`가 `false`면 if문을 통과하지 않고 에러를 발생시키지 않는다.

이 말은 즉 `falsy`한 값을 바인딩 하면 위의 에러 조건을 통과할 수 있음을 의미한다.

실제로 `onClick={''}`, `onClick={0}` 같은 값을 바인딩 하면 위의 에러가 아닌 `Uncaught TypeError` 에러가 발생한다.

![Uncaught TypeError](https://user-images.githubusercontent.com/16220817/179533066-e2fa6ebf-bb32-4af7-b68f-dced4e3aaa9b.png)

## 5. 마무리

사실 별 내용이 아니였지만 개인적으로 처음으로 React 코드를 살펴본 경험이라서 나름 의미가 있었다.

코드를 읽기 전에는 약간 두려움도 있었지만 막상 읽어보니 엄청나게 다르거나 그런건 느끼지 못했다. 하지만 규모가 큰 만큼 어디서 부터 어떻게 찾아갈지는 막막했고 그 점이 어려웠었다.

블로그에 글을 작성할 겸 혹시라도 나처럼 궁금해 할 사람도 있을 수 있으니 기록으로 남겨본다.

function init (myCanvas, tricolor, bgColor, res) {
  let ctx = myCanvas.getContext('2d')

  /*
    @ 得到一个res
    @ 判断数据
  */
  let abcJudge = function (num) {
    // 当有包含关系时候，三个圆不能满足当前情况
    // if (res.abc) {
    //   console.log(num , res.abc.count)
    //   if (num === res.abc.count) {
    //     return 0
    //   } else {
    //     return num
    //   }
    // } else {
    //   return num
    // }
    return num
  }
  let data = {
    a: res.a ? res.a.count : 0,
    b: res.b ? res.b.count : 0,
    c: res.c ? res.c.count : 0,
    ab: res.ab ? abcJudge(res.ab.count) : 0,
    ac: res.ac ? abcJudge(res.ac.count) : 0,
    bc: res.bc ? abcJudge(res.bc.count) : 0,
    abc: res.abc ? res.abc.count : 0
  }

  /*
    @ 计算圆面积
    @ 当a,b,c相差大，需要降为同级
    @ 然后面积比
  */
  // 降维
  let sum1 = data.a + data.b + data.c
  let sum2 = data.ab + data.ac + data.bc
  for (let i in data) {
    if (i.length === 1) {
      data[i]
        ? data[i] = Math.floor((data[i] / sum1 + 1) * 70)
        : data[i] = 0
    }
    if (i.length === 2) {
      data[i]
        ? data[i] = Math.floor((data[i] / sum2 + 1) * 7)
        : data[i] = 0
    }
  }
  // 换算面积
  for (let i in data) {
    if (i.length === 1) {
      data[i] = Math.floor(Math.pow(data[i], 2) / 100)
    }
    if (i.length === 2) {
      /*
        应对abc为真的时候，三个圆不相交问题
        当abc为0，2元的不为0
      */
      if (data.abc) {
        data[i]
          ? data[i] += Math.max(data.ab, data.ac, data.bc)
          : data[i] = 0
      }
    }
    if (i.length === 3) {
      data.abc
        ? data[i] = Math.floor((data[i] / sum2 + 1) * 10)
        : data[i] = 0
    }
  }
  // console.log(data)

  // 各个圆半径
  let ra = data.a / 2
  let rb = data.b / 2
  let rc = data.c / 2
  let lab = data.ab
  let lac = data.ac
  let lbc = data.bc
  // let labc = data.abc

  /*
    @ c的圆心位置
    @ 当任何二级为0，则三级为0
    @ 已知三边，两点，求第三点
      余弦定理,算出cosB,cosA
      又c的圆心距离x轴高度定，则可计算c的y轴距离
  */
  let circle
  let aa = rc + rb - lbc
  let bb = ra + rc - lac
  let cc = ra + rb - lab

  let cosB = (aa * aa + cc * cc - bb * bb) / (aa * cc * 2)
  let cosA = (cc * cc + bb * bb - aa * aa) / (cc * bb * 2)
  let h2 = (aa * aa + cc * cc - bb * bb) / (cc * 2) // Ob到Oc的x轴距离
  let cx = rb - lab - h2
  let cy = Math.sqrt(aa * aa - h2 * h2)

  circle = [
    {x: -ra, y: 0, r: ra, c: tricolor[0]},
    {x: +rb - lab, y: 0, r: rb, c: tricolor[1]},
    {x: cx, y: cy, r: rc, c: tricolor[2]}
  ]

  let circleIndex = [
    {
      index: [0, 1],
      c: tricolor[3]
    },
    {
      index: [0, 2],
      c: tricolor[4]
    },
    {
      index: [1, 2],
      c: tricolor[5]
    },
    {
      index: [0, 1, 2],
      c: tricolor[6]
    }
  ]

  let fontSize = 14

  /*
    @ tooltips
    @ ab相交区域可能包含abc
      则粗略算出ab的上下连线，两头各起始1/4处为引线起始点
    @ ac和 bc的相交，取相交面对角线中点
  */
  let aby = Math.sqrt(rb * rb - Math.pow((rb * rb + (ra + rb - lab) * (ra + rb - lab) - ra * ra) / ((ra + rb - lab) * 2), 2))
  let abx = rb - (rb * rb + (ra + rb - lab) * (ra + rb - lab) - ra * ra) / ((ra + rb - lab) * 2) - lab

  let cosOcb = (rc * rc + Math.pow(rc + rb - lbc, 2) - rb * rb) / (rc * (rc + rb - lbc) * 2)
  let miniHb = cosOcb * rc // oc距离bc对角线
  let BCbei = 0.75
  let BCx = Math.sqrt((rc * rc - miniHb * miniHb) * (1 - cosB * cosB) * (BCbei * BCbei)) // bc对角线下方1/4
  let BCy = cosB * Math.sqrt(rc * rc - miniHb * miniHb) * BCbei // ac对角线下方1/4
  let bcx = cosB * miniHb + cx + BCx// bc对角线中点x
  let bcy = cy - Math.sqrt(miniHb * miniHb * (1 - cosB * cosB)) + BCy

  let cosOca = (rc * rc + Math.pow(rc + ra - lac, 2) - ra * ra) / (rc * (rc + ra - lac) * 2)
  let miniHa = cosOca * rc // oc距离ac对角线
  let ACbei = 0.75
  let ACx = Math.sqrt((rc * rc - miniHa * miniHa) * (1 - cosA * cosA) * (ACbei * ACbei)) // ac对角线下方1/4
  let ACy = cosA * Math.sqrt(rc * rc - miniHa * miniHa) * ACbei // ac对角线下方1/4
  let acx = -cosA * miniHa + cx - ACx // ac对角线中点x
  let acy = cy - Math.sqrt(miniHa * miniHa * (1 - cosA * cosA)) + ACy

  // center and tooltip line option
  let descLine = 90
  let descLineCount = 90
  let upText = 10
  let downText = 20

  // 计算图谱中心
  // 当只有两个圆形时候
  // 判断lab存在，和tooltip字体大小和pading的和
  // 三个圆形时候
  // 判断rc大小
  // (cy + rc) > Math.max(ra, rb), 表示c最大
  // c小于Math.max(ra, rb), 表示c适中
  let centerY = 0
  let downHigh = 0
  let cal1 = function () {
    return Math.max(ra, rb) + Math.min(ra, rb)
  }
  let cal2 = function () {
    return Math.max(ra, rb) + Math.min(ra, rb) + fontSize + upText + fontSize
  }
  // a,b 两个圆形不相交
  if (lab === 0) {
    centerY = downHigh = cal1()
  } else {
    // 当a和b中最小的半径比注释高度小
    if ((fontSize + upText + fontSize) > Math.min(ra, rb)) {
      centerY = downHigh = cal2()
    } else {
      centerY = downHigh = cal1()
    }
  }
  // 三个圆形
  if (rc !== 0) {
    // 存在c
    if (cy > Math.max(ra, rb)) {
      // 当a，b中最大的值都小于cy时候，表示c太大了
      // c太大了
      // 那么使得c距离最下边 = cy + rc + Math.min(ra, rb)
      // c的tooltip就从Oc出发，fontsize距离转折
      downHigh = cy + rc + Math.min(ra, rb)
    } else {
      // 当a,b 中有大于 cy + rc + downText 的，表示有c小的很
      // c的tooltip就从 cy + rc * 0.7 出发，cy + rc 转折
      if ((cy + rc + downText) < Math.max(ra, rb)) {
        // 当a和b中最小的半径比注释高度小
        if ((fontSize + upText + fontSize) > Math.min(ra, rb)) {
          downHigh = cal2()
        } else {
          downHigh = cal1()
        }
      } else {
        downHigh = cy + rc + downText + fontSize
      }
    }
  }

  let rcBiggest = cy > Math.max(ra, rb)
  let lineData = [
    {
      ox: -ra * 1.5,
      oy: -ra * 0.5,
      x1: -ra * 1.5 - descLine / 2,
      y1: -ra * 1,
      x2: -ra * 1.5 + descLine / 2,
      tx: -ra * 1.5 - descLine / 2,
      ty: -ra * 1 - upText,
      name: 'a'
    },
    {
      ox: rb * 1.5 - lab,
      oy: -rb * 0.5,
      x1: rb * 2 - lab,
      y1: -rb * 0.3,
      x2: rb * 2 - lab + descLine,
      tx: rb * 2 - lab,
      ty: -rb * 0.3 - upText,
      name: 'b'
    },
    {
      ox: cx,
      oy: rcBiggest ? cy : cy + rc * 0.7,
      x1: cx,
      y1: rcBiggest ? cy + fontSize : cy + rc * 1,
      x2: cx + descLine,
      tx: rcBiggest ? cx : cx,
      ty: rcBiggest ? cy + fontSize + downText : cy + rc * 1 + downText,
      name: 'c'
    },
    {
      ox: abx,
      oy: -aby * 0.75,
      x1: abx,
      y1: -Math.max(ra, rb) - fontSize,
      x2: abx + descLineCount,
      tx: abx,
      ty: -Math.max(ra, rb) - fontSize - upText,
      name: 'ab'
    },
    {
      ox: acx,
      oy: acy,
      x1: acx - Math.max(ra, rc),
      y1: ra,
      x2: acx - Math.max(ra, rc) - descLineCount,
      tx: acx - Math.max(ra, rc) - descLineCount,
      ty: ra + downText,
      name: 'ac'
    },
    {
      ox: bcx,
      oy: bcy,
      x1: bcx + Math.max(rb, rc),
      y1: rb,
      x2: bcx + Math.max(rb, rc) + descLineCount,
      tx: bcx + Math.max(rb, rc),
      ty: rb + downText,
      name: 'bc'
    },
    {
      ox: abx,
      oy: aby * 0.75,
      x1: rcBiggest ? abx : abx - rc,
      y1: rcBiggest ? ra + fontSize : aby * 0.75 - fontSize,
      x2: rcBiggest ? abx - descLineCount : abx - rc - descLineCount,
      tx: rcBiggest ? abx - descLineCount : abx - rc - descLineCount,
      ty: rcBiggest ? ra + fontSize + downText : aby * 0.75 - fontSize + downText,
      name: 'abc'
    }
  ]

  // 图谱容器
  myCanvas.setAttribute('width', myCanvas.parentElement.offsetWidth)
  myCanvas.setAttribute('height', centerY + downHigh)

  // 图谱背景色
  ctx.beginPath()
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, myCanvas.offsetWidth, myCanvas.offsetHeight)

  // 坐标中心
  let center = [myCanvas.offsetWidth / 2, myCanvas.offsetHeight / 2]
  let chh = centerY
  let centerx = Math.max(ra, rb) === rb ? center[0] : center[0] + ra
  ctx.translate(centerx, centerY)

  // 绘制
  // 底圆
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(circle[i].x, circle[i].y, circle[i].r, 0, 2 * Math.PI)
    ctx.fillStyle = circle[i].c
    ctx.fill()
    ctx.closePath()
  }

  // 交叉部分
  for (let i = 0; i < 4; i++) {
    ctx.restore()
    ctx.save()

    circleIndex[i].index.forEach(function (m, n) {
      ctx.beginPath()
      ctx.arc(circle[m].x, circle[m].y, circle[m].r, 0, 2 * Math.PI)
      ctx.clip()
    })

    ctx.fillStyle = circleIndex[i].c
    ctx.fill()
  }

  // 指线
  let tricolorFlag = 0 // 有效legend排序
  lineData.forEach(function (i, j) {
    if (res[i.name] && res[i.name].count) {
      // line
      ctx.restore()
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(i.ox, i.oy)
      ctx.lineTo(i.x1, i.y1)
      ctx.lineTo(i.x2, i.y1)
      ctx.lineWidth = 1
      ctx.strokeStyle = '#3fe'
      ctx.stroke()
      ctx.closePath()

      // describe
      ctx.restore()
      ctx.save()
      ctx.beginPath()
      ctx.lineWidth = '1'
      ctx.font = fontSize + 'px arial'
      ctx.fillStyle = '#fff'
      ctx.fillText(i.name + ' count : ' + res[i.name].count, i.tx, i.ty)

      // legend
      let r = 5
      let squareSide = 15
      let dou = 7 * tricolorFlag + squareSide * tricolorFlag
      let wordSpace = 7
      ctx.restore()
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(-centerx + squareSide + r, -chh + squareSide + dou)
      ctx.arcTo(-centerx + squareSide * 2, -chh + squareSide + dou, -centerx + squareSide * 2, -chh + squareSide * 2 + dou, r)
      ctx.arcTo(-centerx + squareSide * 2, -chh + squareSide * 2 + dou, -centerx + squareSide, -chh + squareSide * 2 + dou, r)
      ctx.arcTo(-centerx + squareSide, -chh + squareSide * 2 + dou, -centerx + squareSide, -chh + squareSide + dou, r)
      ctx.arcTo(-centerx + squareSide, -chh + squareSide + dou, -centerx + squareSide + r, -chh + squareSide + dou, r)
      ctx.fillStyle = tricolor[j]
      ctx.fill()

      ctx.restore()
      ctx.save()
      ctx.beginPath()
      ctx.lineWidth = '1'
      ctx.font = fontSize + 'px arial'
      ctx.fillStyle = '#fff'
      ctx.fillText(i.name + (res[i.name].name ? ' : ' + res[i.name].name : (res[i.name].rate ? ' : ' + res[i.name].rate.toFixed(3) : '')),
        -centerx + squareSide * 2 + wordSpace,
        -chh + squareSide * 2 + dou - 2)

      tricolorFlag++
    }
  })
  tricolorFlag = 0

  // 坐标轴
  // ctx.restore()
  // ctx.save()
  // ctx.beginPath()
  // ctx.moveTo(0, 0)
  // ctx.lineTo(0, -chh)
  // ctx.lineTo(0, chh)
  // ctx.lineTo(0, 0)
  // ctx.lineTo(center[0], 0)
  // ctx.lineTo(-center[0], 0)
  // ctx.lineWidth = 1
  // ctx.strokeStyle = '#3fe'
  // ctx.stroke()
  // ctx.closePath()
}